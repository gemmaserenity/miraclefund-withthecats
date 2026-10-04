import test from "node:test";
import assert from "node:assert/strict";
import { onRequestPost } from "./contact.js";

const validId = "123e4567-e89b-42d3-a456-426614174000";

function makeForm(overrides = {}) {
  const values = {
    name: "Jane Donor",
    email: "jane@example.com",
    topic: "Donation or payment",
    subject: "Question about my gift",
    message: "I would like help locating my donation receipt.",
    website: "",
    submission_id: validId,
    ...overrides
  };
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}

async function invoke(form, fetchImpl) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fetchImpl;
  try {
    return await onRequestPost({
      request: new Request("https://support.withthecats.org/api/contact", { method: "POST", body: form }),
      env: { RESEND_API_KEY: "re_test" }
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("sends the organizer message and a confirmation copy", async () => {
  const calls = [];
  const response = await invoke(makeForm(), async (_url, options) => {
    calls.push({ payload: JSON.parse(options.body), headers: options.headers });
    return new Response("{}", { status: 200 });
  });

  assert.equal(response.status, 200);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0].payload.to, ["gemma@gemmaserenity.com"]);
  assert.equal(calls[0].payload.from, "With the Cats Support <support@withthecats.org>");
  assert.equal(calls[0].payload.reply_to, "jane@example.com");
  assert.deepEqual(calls[1].payload.to, ["jane@example.com"]);
  assert.match(calls[1].payload.text, /help locating my donation receipt/);
  assert.equal(calls[1].payload.reply_to, "support@withthecats.org");
  assert.equal(calls[0].headers["Idempotency-Key"], `support-${validId}-organizer`);
  assert.equal(calls[1].headers["Idempotency-Key"], `support-${validId}-receipt`);
});

test("escapes message content in both HTML emails", async () => {
  const payloads = [];
  const response = await invoke(makeForm({ message: "Please check <script>alert('x')</script> now." }), async (_url, options) => {
    payloads.push(JSON.parse(options.body));
    return new Response("{}", { status: 200 });
  });

  assert.equal(response.status, 200);
  assert.doesNotMatch(payloads[0].html, /<script>/);
  assert.match(payloads[0].html, /&lt;script&gt;/);
  assert.doesNotMatch(payloads[1].html, /<script>/);
});

test("includes a valid attachment only in the organizer email", async () => {
  const form = makeForm();
  form.set("attachment", new File(["receipt contents"], "receipt.txt", { type: "text/plain" }));
  const payloads = [];
  const response = await invoke(form, async (_url, options) => {
    payloads.push(JSON.parse(options.body));
    return new Response("{}", { status: 200 });
  });

  assert.equal(response.status, 200);
  assert.equal(payloads[0].attachments[0].filename, "receipt.txt");
  assert.equal(payloads[0].attachments[0].content, btoa("receipt contents"));
  assert.equal(payloads[1].attachments, undefined);
  assert.match(payloads[1].text, /Attachment received: receipt\.txt/);
});

test("rejects unsupported attachments before sending", async () => {
  const form = makeForm();
  form.set("attachment", new File(["binary"], "program.exe", { type: "application/octet-stream" }));
  let calls = 0;
  const response = await invoke(form, async () => { calls += 1; return new Response("{}"); });
  assert.equal(response.status, 415);
  assert.equal(calls, 0);
});

test("returns a retriable partial-delivery error when the receipt fails", async () => {
  let calls = 0;
  const response = await invoke(makeForm(), async () => {
    calls += 1;
    return new Response("{}", { status: calls === 1 ? 200 : 500 });
  });
  const body = await response.json();
  assert.equal(response.status, 502);
  assert.equal(body.delivered, true);
});

test("requires the Resend secret", async () => {
  const response = await onRequestPost({
    request: new Request("https://support.withthecats.org/api/contact", { method: "POST", body: makeForm() }),
    env: {}
  });
  assert.equal(response.status, 503);
});
