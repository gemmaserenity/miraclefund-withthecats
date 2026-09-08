import test from "node:test";
import assert from "node:assert/strict";
import { onRequestPost, verifyStripeSignature } from "./stripe-webhook.js";

const secret = "whsec_test_secret";
const timestamp = 1_800_000_000;

async function signatureFor(payload, time = timestamp) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${time}.${payload}`)));
  return `t=${time},v1=${[...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("")}`;
}

function makeEvent(overrides = {}) {
  return {
    id: "evt_123",
    type: "checkout.session.completed",
    created: timestamp,
    livemode: true,
    data: {
      object: {
        id: "cs_live_123",
        payment_link: "plink_campaign",
        payment_status: "paid",
        amount_total: 10000,
        currency: "usd",
        customer_details: { individual_name: "Jane & Smith", email: "jane@example.com" },
        ...overrides
      }
    }
  };
}

async function invoke(event, { eventStore, fetchImpl } = {}) {
  const payload = JSON.stringify(event);
  const request = new Request("https://example.com/api/stripe-webhook", {
    method: "POST",
    headers: { "Stripe-Signature": await signatureFor(payload, Math.floor(Date.now() / 1000)) },
    body: payload
  });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fetchImpl || (async () => new Response("{}", { status: 200 }));
  try {
    return await onRequestPost({
      request,
      env: {
        STRIPE_WEBHOOK_SECRET: secret,
        STRIPE_DONATION_PAYMENT_LINK_ID: "plink_campaign",
        RESEND_API_KEY: "re_test",
        STRIPE_WEBHOOK_EVENTS: eventStore
      }
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("verifies a current Stripe signature and rejects a stale one", async () => {
  const payload = JSON.stringify(makeEvent());
  const header = await signatureFor(payload);
  assert.equal(await verifyStripeSignature(payload, header, secret, timestamp * 1000), true);
  assert.equal(await verifyStripeSignature(payload, header, secret, (timestamp + 301) * 1000), false);
});

test("rejects a forged webhook before sending email", async () => {
  const event = makeEvent();
  const request = new Request("https://example.com/api/stripe-webhook", {
    method: "POST",
    headers: { "Stripe-Signature": `t=${Math.floor(Date.now() / 1000)},v1=00` },
    body: JSON.stringify(event)
  });
  const response = await onRequestPost({
    request,
    env: {
      STRIPE_WEBHOOK_SECRET: secret,
      STRIPE_DONATION_PAYMENT_LINK_ID: "plink_campaign",
      RESEND_API_KEY: "re_test"
    }
  });
  assert.equal(response.status, 400);
});

test("emails the donor name, email, and amount for a paid campaign session", async () => {
  let emailPayload;
  const response = await invoke(makeEvent(), {
    fetchImpl: async (_url, options) => {
      emailPayload = JSON.parse(options.body);
      return new Response("{}", { status: 200 });
    }
  });
  assert.equal(response.status, 200);
  assert.match(emailPayload.subject, /\$100\.00 from Jane & Smith/);
  assert.match(emailPayload.html, /jane@example\.com/);
  assert.match(emailPayload.html, /Jane &amp; Smith/);
});

test("ignores unpaid and unrelated Checkout Sessions", async () => {
  let calls = 0;
  const fetchImpl = async () => { calls += 1; return new Response("{}"); };
  assert.equal((await invoke(makeEvent({ payment_status: "unpaid" }), { fetchImpl })).status, 200);
  assert.equal((await invoke(makeEvent({ payment_link: "plink_other" }), { fetchImpl })).status, 200);
  assert.equal(calls, 0);
});

test("handles asynchronous payment success and suppresses a recorded retry", async () => {
  const stored = new Map();
  const eventStore = {
    get: async key => stored.get(key),
    put: async (key, value) => stored.set(key, value)
  };
  let calls = 0;
  const fetchImpl = async () => { calls += 1; return new Response("{}"); };
  const event = makeEvent();
  event.type = "checkout.session.async_payment_succeeded";
  event.data.object.payment_status = "unpaid";
  assert.equal((await invoke(event, { eventStore, fetchImpl })).status, 200);
  assert.equal((await invoke(event, { eventStore, fetchImpl })).status, 200);
  assert.equal(calls, 1);
});

test("returns an error when Resend fails so Stripe retries", async () => {
  const response = await invoke(makeEvent(), {
    fetchImpl: async () => new Response("failed", { status: 500 })
  });
  assert.equal(response.status, 502);
});
