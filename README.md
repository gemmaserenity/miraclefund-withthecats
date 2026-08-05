# With the Cats — campaign site

An original, static campaign website inspired by the proven information architecture of major crowdfunding pages. It is intentionally platform-independent and ready for GitHub Pages, Cloudflare Pages, Netlify, or any basic web host.

## Preview locally

No build step or dependencies are required. Open `index.html` directly, or run a simple local static server from this folder.

## Before publishing

1. Review the campaign story in `index.html` and replace the remaining campaign email placeholder.
2. Replace `assets/campaign-placeholder.svg` with the main campaign photograph and update the `src`, dimensions, alt text, and social sharing image.
3. In `script.js`, set the current `raised`, `goal`, `donors`, and `launched` values.
4. Replace `campaign@example.com` everywhere with the dedicated campaign email.
5. Replace every `REPLACE_ME` payment handle/link and test it on a phone while logged out.
6. Replace the Amazon Wishlist `REPLACE_ME` link in `script.js` and confirm that sharing is enabled on the intended list.
7. Add a real privacy statement and the organizer's preferred contact details.
8. Keep the $500,000 fundraising goal, current total, donor count, and August 31 deadline current in `script.js`.
9. Review all medical, tax, beneficiary, and use-of-funds wording for accuracy before publishing.

## Important bank-detail policy

Do **not** commit a bank routing number, account number, debit-card number, login, or recovery information to GitHub—even in a private repository—because Git history preserves old values. The scaffold makes ACH/wire a “request secure instructions” option. Send verified bank instructions directly after contact, or connect a reputable hosted payment processor that tokenizes bank information.

## Keeping totals current

The first version stores public campaign totals in `script.js`, making updates immediate after a commit/deploy. A later phase can connect this UI to a database plus provider webhooks so verified gifts update totals automatically. Never count a payment based only on a browser redirect; verify it server-side.

## GitHub Pages

After creating and pushing the repository, open **Settings → Pages**, select **Deploy from a branch**, choose the main branch and root folder, then save. Add a custom domain only after HTTPS is active.

## Legal and trust notes

- This site must not imply affiliation with GoFundMe or use GoFundMe trademarks.
- Personal gifts are not automatically tax-deductible.
- Payment providers have different fees, dispute processes, limits, and fraud protections.
- Publish only claims, totals, and updates you can document.
