const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8" }
});

const escapeHtml = value => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const validTypes = new Set([
  "Transportation",
  "Cat food or litter",
  "Veterinary assistance",
  "Gift card",
  "Housing or property opportunity",
  "Legal or professional guidance",
  "Moving assistance",
  "Media introduction",
  "Business or technical assistance",
  "Other practical support"
]);

const validRecognition = new Set([
  "You may recognize me publicly.",
  "Use my initials only.",
  "Keep my support private."
]);

const attributionKeys = new Set(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"]);

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY) return json({ error: "Messaging is temporarily unavailable." }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid message." }, 400);
  }

  // Quietly accept bot submissions caught by the hidden field.
  if (body.website) return json({ ok: true });

  const type = String(body.type || "");
  const description = String(body.description || "").trim();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const recognition = String(body.recognition || "");
  const estimateNumber = body.estimate === "" ? null : Number(body.estimate);
  const attribution = Object.fromEntries(Object.entries(body.attribution || {})
    .filter(([key, value]) => attributionKeys.has(key) && typeof value === "string" && value.length <= 160));

  if (!validTypes.has(type) || !validRecognition.has(recognition) || description.length < 3 || description.length > 5000) {
    return json({ error: "Please check the message details and try again." }, 400);
  }
  if (name.length > 120 || email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return json({ error: "Please enter a valid name and reply email." }, 400);
  }
  if (estimateNumber !== null && (!Number.isFinite(estimateNumber) || estimateNumber < 0 || estimateNumber > 10000000)) {
    return json({ error: "Please enter a valid estimated value." }, 400);
  }

  const estimate = estimateNumber === null
    ? "Not provided"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(estimateNumber);
  const fields = [
    ["Type of support", type],
    ["Estimated value", estimate],
    ["Offer", description],
    ["Name", name || "Not provided"],
    ["Reply email", email || "Not provided"],
    ["Recognition preference", recognition],
    ["Campaign source", attribution.utm_source || attribution.ref || "Direct"],
    ["Campaign link", Object.entries(attribution).map(([key, value]) => `${key}=${value}`).join("; ") || "No attribution parameters"]
  ];
  const html = fields.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong><br>${escapeHtml(value).replaceAll("\n", "<br>")}</p>`).join("");
  const payload = {
    from: "With the Cats Campaign <donation@withthecats.org>",
    to: ["donation@withthecats.org"],
    subject: `${type} offer from the With the Cats website`,
    html
  };
  if (email) payload.reply_to = email;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!resendResponse.ok) {
    console.error(JSON.stringify({ event: "support_message_rejected", status: resendResponse.status }));
    return json({ error: "Your message could not be delivered. Please try again." }, 502);
  }

  console.log(JSON.stringify({ event: "support_message_sent", type, source: attribution.utm_source || attribution.ref || "direct" }));
  return json({ ok: true });
}

export function onRequest() {
  return json({ error: "Method not allowed." }, 405);
}
