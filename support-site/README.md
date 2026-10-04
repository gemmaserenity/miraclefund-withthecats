# With the Cats support site

Standalone Cloudflare Pages site for `support.withthecats.org`, published from the same GitHub repository as the Miracle Fund site.

## Cloudflare Pages setup

Create a second Pages project connected to `gemmaserenity/miraclefund-withthecats` with:

- Production branch: `main`
- Root directory: `support-site`
- Build command: leave blank
- Build output directory: `.`
- Custom domain: `support.withthecats.org`

Under **Settings → Variables and Secrets**, add `RESEND_API_KEY` as an encrypted production secret and redeploy. The `withthecats.org` sending domain must remain verified in Resend.

The Pages Function at `/api/contact` sends the original message from `support@withthecats.org` to `gemma@gemmaserenity.com`, with the visitor's address as the reply-to. It then sends the visitor a confirmation copy from `support@withthecats.org`. The optional attachment is delivered to the support inbox; the confirmation records its filename and size without duplicating the file.

## Incoming support email

In Cloudflare Email Routing, add a custom address rule:

- Custom address: `support@withthecats.org`
- Destination: `gemma@gemmaserenity.com`

Cloudflare requires the destination address to be verified before the rule becomes active.

## Local verification

Run the function tests from this directory:

```sh
node --test functions/api/contact.test.mjs
```

For a full Pages preview, use a current Wrangler installation and provide a local `RESEND_API_KEY` through an ignored `.dev.vars` file. Never commit the key.
