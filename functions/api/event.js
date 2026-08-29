const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  }
});

const allowedEvents = new Set([
  "donation_dialog_opened",
  "suggested_gift_selected",
  "gift_amount_confirmed",
  "payment_method_selected",
  "campaign_shared",
  "campaign_link_copied",
  "update_subscription_completed"
]);

const allowedFields = new Set([
  "event", "page", "placement", "amount", "method", "platform",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"
]);

export async function onRequestPost({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }

  if (!allowedEvents.has(body.event)) return json({ ok: false }, 400);

  const event = Object.fromEntries(Object.entries(body)
    .filter(([key, value]) => allowedFields.has(key) && (
      typeof value === "string" || typeof value === "number" || value === null
    ))
    .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 160) : value]));

  console.log(JSON.stringify({ ...event, recorded_at: new Date().toISOString() }));
  return json({ ok: true }, 202);
}

export function onRequest() {
  return json({ error: "Method not allowed." }, 405);
}
