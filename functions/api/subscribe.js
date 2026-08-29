const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  }
});

const MAILER_FALLBACK_URL = "https://mailer-worker.gemma-serenity.workers.dev";
const attributionKeys = new Set(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"]);

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Please enter a valid email address." }, 400);
  }

  // Quietly accept bot submissions caught by the hidden field.
  if (body.website) return json({ ok: true });

  const email = String(body.email || "").trim().toLowerCase();
  const firstName = String(body.first_name || "").trim();
  const consent = body.consent === true;
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Please enter a valid email address." }, 400);
  }
  if (firstName.length > 80) return json({ error: "Please shorten the first name." }, 400);
  if (!consent) return json({ error: "Please confirm that you want to receive campaign updates." }, 400);

  const attribution = Object.fromEntries(Object.entries(body.attribution || {})
    .filter(([key, value]) => attributionKeys.has(key) && typeof value === "string" && value.length <= 160));

  const payload = JSON.stringify({
    campaign: "miracle-fund",
    email,
    first_name: firstName,
    consent: true,
    source: attribution.utm_source || attribution.ref || "miraclefund-website",
    attribution
  });

  const upstreamRequest = new Request("https://mailer.internal/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload
  });

  let response;
  try {
    response = env.MAILER?.fetch
      ? await env.MAILER.fetch(upstreamRequest)
      : await fetch(`${env.MAILER_SUBSCRIBE_URL || MAILER_FALLBACK_URL}/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload
        });
  } catch (error) {
    console.error(JSON.stringify({ event: "miracle_fund_subscribe_upstream_failed", error: String(error) }));
    return json({ error: "Updates are temporarily unavailable. Please try again shortly." }, 502);
  }

  if (!response.ok) {
    console.error(JSON.stringify({ event: "miracle_fund_subscribe_rejected", status: response.status }));
    return json({ error: "Updates are temporarily unavailable. Please try again shortly." }, 502);
  }

  console.log(JSON.stringify({ event: "miracle_fund_subscribed", source: attribution.utm_source || "direct" }));
  return json({ ok: true });
}

export function onRequest() {
  return json({ error: "Method not allowed." }, 405);
}
