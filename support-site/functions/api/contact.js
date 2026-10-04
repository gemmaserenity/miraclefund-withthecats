const SUPPORT_FROM = "With the Cats Support <support@withthecats.org>";
const SUPPORT_ADDRESS = "support@withthecats.org";
const DESTINATION = "gemma@gemmaserenity.com";
const MAX_REQUEST_BYTES = 7 * 1024 * 1024;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const VALID_TOPICS = new Set([
  "Donation or payment",
  "Receipt or confirmation",
  "Technical problem",
  "Offer of help",
  "Other question"
]);
const ALLOWED_EXTENSIONS = new Set(["pdf", "png", "jpg", "jpeg", "heic", "heif", "txt", "doc", "docx"]);
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/heic",
  "image/heif",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream"
]);

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  }
});

const escapeHtml = value => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isUuid = value => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

function cleanFilename(value) {
  const base = String(value).split(/[\\/]/).pop() || "attachment";
  return base.replace(/[^a-zA-Z0-9._() -]/g, "_").slice(0, 120) || "attachment";
}

function fileExtension(filename) {
  return filename.includes(".") ? filename.split(".").pop().toLowerCase() : "";
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} bytes`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

async function sendEmail(apiKey, payload, idempotencyKey) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey
    },
    body: JSON.stringify(payload)
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY) return json({ error: "Messaging is temporarily unavailable. Please email support@withthecats.org directly." }, 503);

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_REQUEST_BYTES) return json({ error: "The attachment is too large. Please choose a file smaller than 5 MB." }, 413);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "We could not read this message. Please check the form and try again." }, 400);
  }

  // Quietly accept automated submissions caught by the hidden field.
  if (String(form.get("website") || "")) return json({ ok: true });

  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const topic = String(form.get("topic") || "").trim();
  const subject = String(form.get("subject") || "").trim();
  const message = String(form.get("message") || "").trim();
  const suppliedId = String(form.get("submission_id") || "").trim();
  const requestId = isUuid(suppliedId) ? suppliedId : crypto.randomUUID();

  if (!name || name.length > 120 || !isEmail(email) || email.length > 254) {
    return json({ error: "Please enter your name and a valid email address." }, 400);
  }
  if (!VALID_TOPICS.has(topic) || subject.length < 2 || subject.length > 160 || message.length < 10 || message.length > 5000) {
    return json({ error: "Please choose a topic and check the subject and message." }, 400);
  }

  const rawAttachment = form.get("attachment");
  const hasAttachment = rawAttachment && typeof rawAttachment === "object" && typeof rawAttachment.arrayBuffer === "function" && rawAttachment.size > 0;
  let attachment = null;

  if (hasAttachment) {
    const filename = cleanFilename(rawAttachment.name);
    const extension = fileExtension(filename);
    const mimeType = String(rawAttachment.type || "application/octet-stream").toLowerCase();
    if (rawAttachment.size > MAX_ATTACHMENT_BYTES) {
      return json({ error: "The attachment is too large. Please choose a file smaller than 5 MB." }, 413);
    }
    if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(mimeType)) {
      return json({ error: "That file type is not supported. Please attach a PDF, image, text, or Word document." }, 415);
    }
    attachment = {
      filename,
      size: rawAttachment.size,
      content: toBase64(await rawAttachment.arrayBuffer())
    };
  }

  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    topic: escapeHtml(topic),
    subject: escapeHtml(subject),
    message: escapeHtml(message).replaceAll("\n", "<br>")
  };
  const attachmentText = attachment ? `${attachment.filename} (${formatBytes(attachment.size)})` : "None";
  const organizerText = [
    "New support message from support.withthecats.org",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Topic: ${topic}`,
    `Subject: ${subject}`,
    `Attachment: ${attachmentText}`,
    "",
    message
  ].join("\n");
  const organizerHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#222;max-width:680px">
      <div style="height:8px;background:#f27405"></div>
      <h1 style="color:#3357b8">New support message</h1>
      <p><strong>Name:</strong> ${safe.name}<br>
      <strong>Email:</strong> <a href="mailto:${safe.email}">${safe.email}</a><br>
      <strong>Topic:</strong> ${safe.topic}<br>
      <strong>Subject:</strong> ${safe.subject}<br>
      <strong>Attachment:</strong> ${escapeHtml(attachmentText)}</p>
      <div style="padding:18px;border-left:5px solid #f27405;background:#fff1e0">${safe.message}</div>
    </div>`;
  const organizerPayload = {
    from: SUPPORT_FROM,
    to: [DESTINATION],
    reply_to: email,
    subject: `[With the Cats Support] ${subject}`,
    text: organizerText,
    html: organizerHtml,
    tags: [{ name: "source", value: "support-site" }]
  };
  if (attachment) organizerPayload.attachments = [{ filename: attachment.filename, content: attachment.content }];

  let organizerResponse;
  try {
    organizerResponse = await sendEmail(env.RESEND_API_KEY, organizerPayload, `support-${requestId}-organizer`);
  } catch (error) {
    console.error(JSON.stringify({ event: "support_delivery_failed", stage: "organizer", reason: "network" }));
    return json({ error: "Your message could not be delivered. Please try again or email support@withthecats.org directly." }, 502);
  }
  if (!organizerResponse.ok) {
    console.error(JSON.stringify({ event: "support_delivery_failed", stage: "organizer", status: organizerResponse.status }));
    return json({ error: "Your message could not be delivered. Please try again or email support@withthecats.org directly." }, 502);
  }

  const receiptText = [
    `Hello ${name},`,
    "",
    "We received your message to With the Cats Support. This is your copy for confirmation and follow-up.",
    "",
    `Topic: ${topic}`,
    `Subject: ${subject}`,
    `Attachment received: ${attachmentText}`,
    "",
    "Your message:",
    message,
    "",
    `Reply to this email or write to ${SUPPORT_ADDRESS} if you would like to add anything.`,
    "",
    "With the Cats Support"
  ].join("\n");
  const receiptHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#222;max-width:680px">
      <div style="height:8px;background:#f27405"></div>
      <h1 style="color:#3357b8">We received your message</h1>
      <p>Hello ${safe.name},</p>
      <p>This is your copy for confirmation and follow-up.</p>
      <p><strong>Topic:</strong> ${safe.topic}<br>
      <strong>Subject:</strong> ${safe.subject}<br>
      <strong>Attachment received:</strong> ${escapeHtml(attachmentText)}</p>
      <p><strong>Your message:</strong></p>
      <div style="padding:18px;border-left:5px solid #f27405;background:#fff1e0">${safe.message}</div>
      <p>Reply to this email or write to <a href="mailto:${SUPPORT_ADDRESS}">${SUPPORT_ADDRESS}</a> if you would like to add anything.</p>
      <p><strong>With the Cats Support</strong></p>
    </div>`;
  const receiptPayload = {
    from: SUPPORT_FROM,
    to: [email],
    reply_to: SUPPORT_ADDRESS,
    subject: `We received your message: ${subject}`,
    text: receiptText,
    html: receiptHtml,
    headers: {
      "Auto-Submitted": "auto-generated",
      "X-Auto-Response-Suppress": "All"
    },
    tags: [{ name: "source", value: "support-receipt" }]
  };

  let receiptResponse;
  try {
    receiptResponse = await sendEmail(env.RESEND_API_KEY, receiptPayload, `support-${requestId}-receipt`);
  } catch (error) {
    console.error(JSON.stringify({ event: "support_delivery_failed", stage: "receipt", reason: "network" }));
    return json({ delivered: true, error: "Your message was delivered, but the confirmation copy could not be sent. Please try again." }, 502);
  }
  if (!receiptResponse.ok) {
    console.error(JSON.stringify({ event: "support_delivery_failed", stage: "receipt", status: receiptResponse.status }));
    return json({ delivered: true, error: "Your message was delivered, but the confirmation copy could not be sent. Please try again." }, 502);
  }

  console.log(JSON.stringify({ event: "support_message_sent", topic, attachment: Boolean(attachment) }));
  return json({ ok: true });
}

export function onRequest() {
  return json({ error: "Method not allowed." }, 405);
}
