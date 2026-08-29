# With the Cats - campaign site

An original, static campaign website inspired by the proven information architecture of major crowdfunding pages. It is intentionally platform-independent and ready for GitHub Pages, Cloudflare Pages, Netlify, or any basic web host.

## Preview locally

No build step or dependencies are required. Open `index.html` directly, or run a simple local static server from this folder.

## Campaign data

`campaign-data.js` is the single browser-side source for the verified mortgage target, new usable mortgage funds, deadline labels, historical support, and campaign URLs. Update verified figures there first; `script.js` applies them to every matching display on the page.

## Forms and campaign updates

The private support form posts to the Cloudflare Pages Function at `/api/support`, which sends the message to `donation@withthecats.org` through Resend. In the Cloudflare Pages project, add `RESEND_API_KEY` as an encrypted production secret under **Settings → Variables and Secrets**, then redeploy. The `withthecats.org` sending domain must also be verified in Resend. Never put the API key in this repository or in browser-side JavaScript.

The campaign follow form requires an explicit consent checkbox and posts to `/api/subscribe`. That Pages Function forwards consent and limited campaign attribution to the mailer Worker. Configure either a `MAILER` service binding or a `MAILER_SUBSCRIBE_URL`; the current Worker URL is used as a fallback. The mailer Worker must have `MIRACLE_FUND_SEQUENCE_ID` configured and the corresponding sequence must be active before publishing the form.

`/api/event` records an allowlisted set of campaign interactions in Cloudflare logs without collecting names or email addresses. Cloudflare Web Analytics can be enabled separately in the Pages dashboard for page-level traffic reporting.

## Before publishing

1. Review the campaign story in `index.html` and confirm the public campaign email remains current.
2. Confirm the selected campaign photograph, dimensions, alt text, caption, and social-sharing preview remain current.
3. In `campaign-data.js`, set the verified current mortgage figures, goals, donor count, and deadline labels.
4. Test `home@withthecats.org` from an unrelated external email account and confirm it reaches the mailer workflow.
5. Test every payment option on a phone while logged out; keep Wise hidden until its profile is verified.
6. Confirm that the configured Amazon Wishlist remains publicly shared and does not reveal an unwanted shipping address.
7. Add a real privacy statement and the organizer's preferred contact details.
8. Keep the exact urgent mortgage target, $500,000 long-term goal, current total, donor count, and deadline labels current in `campaign-data.js`.
9. Review all medical, tax, beneficiary, and use-of-funds wording for accuracy before publishing.

## Important bank-detail policy

Do **not** commit a bank routing number, account number, debit-card number, login, or recovery information to GitHub - even in a private repository - because Git history preserves old values. The scaffold makes ACH/wire a “request secure instructions” option. Send verified bank instructions directly after contact, or connect a reputable hosted payment processor that tokenizes bank information.

## Keeping totals current

The site stores verified public campaign figures in `campaign-data.js`, making updates immediate after a commit/deploy. A later phase can connect this UI to a database plus provider webhooks so verified gifts update totals automatically. Never count a payment based only on a browser redirect; verify it server-side.

## GitHub Pages

After creating and pushing the repository, open **Settings → Pages**, select **Deploy from a branch**, choose the main branch and root folder, then save. Add a custom domain only after HTTPS is active.

## Legal and trust notes

- This site must not imply affiliation with GoFundMe or use GoFundMe trademarks.
- Personal gifts are not automatically tax-deductible.
- Payment providers have different fees, dispute processes, limits, and fraud protections.
- Publish only claims, totals, and updates you can document.
