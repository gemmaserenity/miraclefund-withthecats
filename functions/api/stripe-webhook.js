const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8" }
});

const SIGNATURE_TOLERANCE_SECONDS = 300;
const EVENT_TTL_SECONDS = 60 * 60 * 24 * 30;

const escapeHtml = value => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const hexToBytes = hex => {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) return null;
  return new Uint8Array(hex.match(/.{2}/g).map(byte => Number.parseInt(byte, 16)));
};

const equalBytes = (left, right) => {
  if (!left || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
};

export async function verifyStripeSignature(payload, signatureHeader, secret, now = Date.now()) {
  if (!signatureHeader || !secret) return false;

  const parts = signatureHeader.split(",").map(part => part.trim().split("="));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  const timestampNumber = Number(timestamp);

  if (!Number.isFinite(timestampNumber) || Math.abs(Math.floor(now / 1000) - timestampNumber) > SIGNATURE_TOLERANCE_SECONDS) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expected = new Uint8Array(await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`)
  ));

  return signatures.some(signature => equalBytes(hexToBytes(signature), expected));
}

const notificationDetails = session => {
  const customer = session.customer_details || {};
  const collected = session.collected_information || {};
  const name = customer.individual_name || collected.individual_name ||
    customer.business_name || collected.business_name || customer.name || "Not provided";
  const email = customer.email || session.customer_email || "Not provided";
  const amount = Number.isInteger(session.amount_total)
    ? new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: String(session.currency || "usd").toUpperCase()
    }).format(session.amount_total / 100)
    : "Amount unavailable";

  return { name, email, amount };
};

const isPaidDonation = event => {
  if (event.type === "checkout.session.async_payment_succeeded") return true;
  return event.type === "checkout.session.completed" && event.data?.object?.payment_status === "paid";
};

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_WEBHOOK_SECRET || !env.RESEND_API_KEY || !env.STRIPE_DONATION_PAYMENT_LINK_ID) {
    console.error(JSON.stringify({ event: "stripe_webhook_configuration_missing" }));
    return json({ error: "Webhook is not configured." }, 503);
  }

  const payload = await request.text();
  const signature = request.headers.get("Stripe-Signature");
  if (!await verifyStripeSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET)) {
    return json({ error: "Invalid signature." }, 400);
  }

  let event;
  try {
    event = JSON.parse(payload);
  } catch {
    return json({ error: "Invalid event." }, 400);
  }

  if (!isPaidDonation(event)) return json({ received: true });

  const session = event.data.object;
  if (session.payment_link !== env.STRIPE_DONATION_PAYMENT_LINK_ID) {
    return json({ received: true });
  }

  const eventKey = `stripe:${event.id}`;
  if (env.STRIPE_WEBHOOK_EVENTS && await env.STRIPE_WEBHOOK_EVENTS.get(eventKey)) {
    return json({ received: true, duplicate: true });
  }

  const { name, email, amount } = notificationDetails(session);
  const destination = env.DONATION_NOTIFICATION_EMAIL || "donation@withthecats.org";
  const mode = event.livemode ? "Live" : "Test";
  const received = Number.isFinite(event.created)
    ? new Date(event.created * 1000).toLocaleString("en-US", { timeZone: "America/Phoenix", timeZoneName: "short" })
    : "Unavailable";
  const fields = [
    ["Customer name", name],
    ["Customer email", email],
    ["Amount", amount],
    ["Payment status", "Paid"],
    ["Received", received],
    ["Stripe Checkout Session", session.id || "Unavailable"],
    ["Stripe event", event.id],
    ["Mode", mode]
  ];
  const html = fields
    .map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong><br>${escapeHtml(value)}</p>`)
    .join("");

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "With the Cats Campaign <donation@withthecats.org>",
      to: [destination],
      subject: `${event.livemode ? "New Miracle Fund donation" : "TEST Stripe donation"} — ${amount} from ${name}`,
      html
    })
  });

  if (!resendResponse.ok) {
    console.error(JSON.stringify({ event: "stripe_donation_notification_rejected", status: resendResponse.status, stripeEvent: event.id }));
    return json({ error: "Notification could not be delivered." }, 502);
  }

  if (env.STRIPE_WEBHOOK_EVENTS) {
    await env.STRIPE_WEBHOOK_EVENTS.put(eventKey, "sent", { expirationTtl: EVENT_TTL_SECONDS });
  } else {
    console.warn(JSON.stringify({ event: "stripe_webhook_deduplication_unavailable", stripeEvent: event.id }));
  }

  console.log(JSON.stringify({ event: "stripe_donation_notification_sent", stripeEvent: event.id, mode }));
  return json({ received: true });
}

export function onRequest() {
  return json({ error: "Method not allowed." }, 405);
}
