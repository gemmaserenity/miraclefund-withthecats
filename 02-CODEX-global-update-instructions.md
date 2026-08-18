# CODEX GLOBAL UPDATE INSTRUCTIONS

## Miracle Fund campaign — final consolidated implementation specification

Read this document **first**, then read `01-miraclefund-final-page-copy.md` in full before changing any code.

These two files are the complete implementation package and the only active sources of truth:

1. `02-CODEX-global-update-instructions.md` — implementation, visual, functional, accessibility, data-binding, privacy, and QA instructions.
2. `01-miraclefund-final-page-copy.md` — the complete final public-facing copy, in exact page order.

The earlier files `text-replacement-1.md`, `text-replacement-2.md`, `text-replacement-3.md`, `text-replacement-4.md`, and `visual-modification.md` are superseded. Do not merge from them, choose among them, or reintroduce language from them. They may be archived for provenance, but they are not implementation inputs.

---

# 1. PRIMARY OBJECTIVE

Update the existing Miracle Fund page methodically so that:

- The final public narrative exactly follows `01-miraclefund-final-page-copy.md`.
- All references or notions concerning a cohabitation agreement are removed.
- No numerical count of the cats appears anywhere in the public experience.
- The page clearly explains the promises made to Gemma and Sascha, their reliance upon those promises, the alleged emotional abuse and destabilization described in the copy, the written deadline, the financial consequences, the danger to Sascha, and the central role of the bonded feline family.
- The existing fundraiser functionality, payment paths, support forms, evidence links, transparency disclosures, analytics, and responsive behavior remain operational.
- The final result feels urgent, intimate, dignified, credible, and emotionally compelling—not visually sensationalized or technically fragile.

Do not rewrite the master copy, soften it, embellish it, summarize it, or add new allegations. Implement it as written, subject only to the dynamic-token and interface rules below.

---

# 2. SOURCE PRECEDENCE

Use this strict precedence order:

1. This instruction file controls implementation.
2. `01-miraclefund-final-page-copy.md` controls all visible page language and section order.
3. The existing production code controls working integrations and functionality that these files do not explicitly replace.
4. Existing assets and linked evidence remain in use unless these instructions explicitly say otherwise.

When old page language conflicts with the master copy, the master copy wins.

When an old visual style conflicts with this document, this document wins.

When a functional integration is not discussed here, preserve it.

---

# 3. BACKUP AND CHANGE DISCIPLINE

Before editing:

- Create a backup, branch, or restorable snapshot of the current working page.
- Identify the page component(s), content source(s), CSS variables, donation-data source, payment handlers, practical-support form handler, analytics hooks, evidence links, social metadata, and structured data.
- Do not replace the entire application blindly if the page is integrated into an existing site.
- Make the smallest reliable code changes needed to implement the complete new experience.

After editing:

- Review the diff for accidental removal of integrations, scripts, identifiers, event handlers, form destinations, tracking, or security attributes.
- Do not deploy until every acceptance check in Section 15 passes.

---

# 4. CONTENT IMPLEMENTATION

Use `01-miraclefund-final-page-copy.md` as the complete page-content map.

Rules:

- Preserve the section order in the master file.
- Treat bracketed text such as `[PROTECT SASCHA AND KEEP OUR FAMILY TOGETHER]` as button or link labels, not literal body text with brackets.
- Treat Markdown headings as semantic page headings.
- Do not render the HTML comment at the top of the master file.
- Do not render Markdown separators as raw characters; convert them into appropriate section boundaries or spacing.
- Preserve intentional short paragraphs. They provide pacing and must not be collapsed into dense text blocks.
- Preserve the exact factual dates, times, financial figures, and quoted language in the master copy.
- Preserve first-person authorship as Gemma. Do not convert the story into third-person institutional copy.
- Do not identify J.J. by full name or add personal data not already intended for public display.
- Do not expose unredacted correspondence, private addresses, account details, medical records, or third-party personal information.

## Prohibited content

Remove the following from visible copy, hidden copy, metadata, accessibility text, comments intended for rendered output, share messages, and structured data:

- “cohabitation agreement”
- “co-habitation agreement”
- Any paraphrase presenting such an agreement as part of the campaign story
- Any numerical cat count, including digits, written numbers, or phrases that reveal a precise count
- Any outdated static countdown such as “26 days”
- Any hard-coded “$0 raised” or “0 supporters” value
- Internal drafting notes
- References to the four superseded replacement drafts

Preferred feline-family language is already embedded in the master copy. Keep it varied and natural, including:

- “our entire bonded feline family”
- “our beloved cats”
- “the animals who know us as home”
- “every member of our family—human and feline”
- “a large, closely bonded indoor feline family”

Do not replace these with the vague phrase “many cats” throughout the page.

---

# 5. DYNAMIC TOKENS AND LIVE DATA

The master copy contains four token types. Replace them with live, formatted UI values; never show the braces publicly.

## `{{AMOUNT_RAISED}}`

- Bind to the existing authoritative campaign-total data source.
- Format as United States currency without unnecessary decimals.
- Example: `$12,450`.
- Do not reset or hard-code the amount during the content update.

## `{{SUPPORTER_LABEL}}`

- Bind to the existing authoritative count of actual financial supporters.
- Use grammatically correct singular/plural formatting:
  - `1 financial supporter`
  - `24 financial supporters`
- Do not mix reactions, hearts, private encouragement, in-kind assistance, or page views into the financial-supporter number.
- If no reliable financial-supporter count exists, omit this label rather than inventing one.

## `{{COUNTDOWN_LABEL}}`

Calculate against the stated deadline:

- Deadline: August 31, 2026 at 11:59 p.m.
- Time zone: `America/Phoenix`
- Use the site’s current time at render/update.
- Use natural grammar, for example:
  - `26 days remain`
  - `1 day remains`
  - `11 hours remain`
  - `The stated deadline has arrived`
- Never display a negative number.
- Use a stable date/time library or platform API with explicit time-zone handling.

## `{{COUNTDOWN_HEADING}}`

Render an uppercase heading derived from the same deadline state, for example:

- `26 DAYS REMAIN`
- `1 DAY REMAINS`
- `THE STATED DEADLINE HAS ARRIVED`

The heading and inline countdown must be generated from one shared function so they cannot disagree.

Do not alter the historical campaign-update date of August 5, 2026. That is a dated update, not a live countdown.

---

# 6. EXISTING FUNCTIONALITY TO PRESERVE

Keep all working functionality unless a label or location is explicitly changed in the master copy:

- Donation-total data source
- Financial-supporter data source
- Payment-provider choices and outbound payment links
- Donation amount selector
- “Continue to payment” flow
- Practical-support form
- Mail-app handoff or existing submission behavior
- Contact-Gemma action
- Media-contact action
- Evidence/document links
- Social-share actions
- Copy-link behavior
- Campaign updates
- Analytics and conversion events
- Security protections on external links
- Existing privacy-safe support ledger behavior
- Responsive navigation and footer behavior

Do not rename element IDs, API parameters, analytics events, form field names, or JavaScript hooks unless required. When labels change, keep the underlying working handler attached.

Do not create fake donations, supporters, hearts, endorsements, testimonials, matching gifts, press logos, urgency counters, activity notifications, or scarcity messages.

---

# 7. MEDICAL-EVIDENCE PLACEMENT

The master copy includes two links labeled `[READ THE SUPPORTING MEDICAL BACKGROUND]`.

Implementation rules:

- Point both links to the existing 12-page supporting medical-background PDF already used by the campaign.
- Do not invent a physician statement, medical endorsement, diagnosis, citation, or credential.
- Do not alter the PDF as part of this page update unless separately instructed.
- Place the first link directly beneath the principal medical-risk and feline-family section, as shown in the master copy.
- Keep the second link in the shorter supporting-background section.
- Open the PDF accessibly and predictably; if opening in a new tab, use appropriate `rel="noopener noreferrer"` and tell screen-reader users that it opens a PDF/new tab.
- Keep the campaign wording exactly as written. Do not add stronger medical conclusions beyond the master copy.

---

# 8. CTA HIERARCHY

Use one dominant primary CTA label across the main narrative:

**PROTECT SASCHA AND KEEP OUR FAMILY TOGETHER**

Use the following labels where specified:

- `CONTINUE TO PAYMENT` inside the transactional donation window
- `SHARE THEIR STORY` as the principal secondary share action where a paired CTA is appropriate
- `OFFER PRACTICAL SUPPORT` for nonfinancial help
- `MEDIA AND PRESS CONTACT` for journalists
- `CONTACT GEMMA` for organizer contact
- `READ THE SUPPORTING MEDICAL BACKGROUND` for the PDF

CTA rules:

- Do not place more than one primary-colored CTA and one secondary action in the same immediate visual cluster.
- Keep primary actions visually consistent across the page.
- Repeat the primary CTA at the hero, after major emotional sections, before exit points, and in the closing appeal as mapped in the master copy.
- Preserve keyboard activation, visible focus, hover states, and touch targets of at least 44 by 44 CSS pixels.
- Do not use guilt-inducing pop-ups, fake closing dialogs, forced timers, or obstructive overlays.

---

# 9. VISUAL SYSTEM

Keep the present page architecture where practical, but apply this visual system consistently.

## Core colors

Define reusable CSS custom properties rather than scattering literal values:

```css
:root {
  --campaign-ivory: #FFF8EF;
  --campaign-navy: #17243A;
  --campaign-burgundy: #8E2938;
  --campaign-gold: #C6A052;
  --campaign-charcoal: #292522;
}
```

Use:

- Warm ivory `#FFF8EF` for the main story background.
- Midnight navy `#17243A` for the hero, footer, and selected high-trust sections.
- Deep burgundy `#8E2938` for the deadline bar and primary donation CTAs.
- Muted gold `#C6A052` only for milestones, progress, rules, small icons, and hopeful accents.
- Dark charcoal `#292522` for body copy on light backgrounds.

Do not flood the page with red or burgundy. Burgundy must retain its power by being reserved for urgency and primary action.

## Contrast

- Meet WCAG 2.2 AA contrast requirements for text, buttons, form controls, focus indicators, and links.
- Do not use muted gold for small body text on ivory.
- Verify burgundy button text contrast; use ivory or white only when the measured contrast passes.
- Never communicate deadline, progress, or validation state by color alone.

## Typography

- Use an elegant, readable serif for principal headings if the site already supports one, preferably Fraunces, Libre Baskerville, or Cormorant Garamond.
- Use Inter, Source Sans 3, or the existing highly readable sans-serif for body copy.
- Do not add script fonts.
- Preserve comfortable line length, approximately 60–75 characters for long-form body text.
- Use responsive type sizing with `clamp()` where appropriate.
- Keep body text at least 16px, preferably 17–18px on desktop long-form sections.

## Spacing and rhythm

- Give emotional passages breathing room.
- Maintain clear separation between story, evidence, budget, media, donation, and transparency sections.
- Use short paragraphs as written; do not compress them into walls of text.
- Use subtle dividers and spacing rather than excessive cards around every paragraph.

---

# 10. HERO IMAGE

Use the strongest existing authentic photograph of Sascha with a cat.

- Crop tightly around Sascha’s face, hands, and the cat.
- Remove or crop out distracting room clutter, printer equipment, magazines, and irrelevant objects.
- Prefer CSS `object-fit: cover` and a carefully tested `object-position` before creating a destructive new crop.
- Preserve the original image asset.
- Do not use stock imagery or AI-generated documentary imagery.
- Supply concise, factual alt text that describes the visible moment without a numerical cat count or medical claim.
- Ensure the crop works on desktop, tablet, and narrow mobile screens.
- Do not place essential text over visually busy parts of the photograph.

---

# 11. PAGE STRUCTURE AND RESPONSIVE BEHAVIOR

Implement the master copy using semantic HTML:

- One `<h1>` only.
- Logical descending heading order.
- `<main>`, `<section>`, `<nav>`, `<footer>`, `<blockquote>`, and form landmarks where appropriate.
- Real buttons for actions and real links for navigation/outbound destinations.
- Lists for budget items, media themes, help types, and transparency promises.

Responsive requirements:

- No horizontal scrolling at 320px width.
- Donation controls, amount buttons, share controls, and practical-support fields must remain usable on mobile.
- The primary CTA should remain immediately accessible near the top without hiding core content behind a persistent overlay.
- A compact sticky mobile action bar may contain only two actions: `GIVE NOW` and `SHARE`, provided it does not cover content, cookie controls, or form buttons.
- The long-form story must remain readable without accordion-gating the essential narrative.

Performance requirements:

- Optimize the hero image responsively using `srcset`/sizes or the framework’s image component.
- Avoid layout shift by reserving image and progress-bar dimensions.
- Do not add heavy animation libraries.
- Respect `prefers-reduced-motion`.

---

# 12. SOCIAL, MEDIA, AND SEARCH METADATA

Update the page metadata to match the final campaign without disclosing a numerical cat count.

Recommended title:

`Protect Sascha and Keep His Beloved Family Together | With the Cats`

Recommended description:

`A disabled Arizona man and his wife face an August 31 housing deadline after years of family sacrifice. Help them secure a permanent home without separating Sascha from the bonded cats who are his comfort, purpose, and family.`

Requirements:

- Use the same title/description for Open Graph and adapt appropriately for X/Twitter cards.
- Use the authentic hero photograph as the social image, with a clean crop suitable for 1.91:1 preview cards.
- Do not place a numerical cat count in page title, description, Open Graph text, X/Twitter text, JSON-LD, image alt text, or generated share messages.
- Update the social-share message to the exact suggested wording in the master copy.
- Do not add unsupported “viral,” “breaking,” “exclusive,” press-coverage, or endorsement claims.
- Preserve canonical URL and existing indexing directives unless they are currently incorrect.

If structured data is present:

- Keep it truthful and consistent with visible content.
- Do not misrepresent the campaign as a registered charity.
- Do not add ratings, reviews, donations, organizer credentials, or media coverage that are not real and verifiable.

---

# 13. FORMS, SAFETY, AND PRIVACY

Donation and practical-support interfaces must:

- Use explicit labels, not placeholder-only fields.
- Preserve validation and error messages.
- Preserve the public-recognition options exactly.
- Never request passwords, verification codes, account login credentials, or unnecessary sensitive data.
- Preserve the warning to confirm the recipient name before payment.
- Preserve the distinction between cash support and estimated in-kind assistance.
- Preserve the statement that this is a personal fundraiser and contributions are not represented as tax-deductible.
- Prevent double submission where applicable.
- Sanitize any displayed user input.

Do not add a public supporter wall unless it is already backed by permission-aware data.

---

# 14. IMPLEMENTATION SEQUENCE

Execute in this order:

1. Back up the working page and inspect existing integrations.
2. Create/update the shared campaign color and typography tokens.
3. Replace the public copy section by section using the master file.
4. Remove all cohabitation-agreement references and exact cat counts from every public surface.
5. Bind the four master-copy dynamic tokens to live values.
6. Normalize CTA labels while preserving their handlers.
7. Apply the hero-image crop and responsive image behavior.
8. Update metadata and share text.
9. Verify evidence/PDF links and contact actions.
10. Verify donation and practical-support flows end to end.
11. Run accessibility, responsive, performance, and content QA.
12. Review the final diff and deploy only after acceptance criteria pass.

---

# 15. ACCEPTANCE CRITERIA

The implementation is complete only when all of the following are true.

## Content

- The public page follows `01-miraclefund-final-page-copy.md` in full and in order.
- No internal comments or drafting instructions are visible.
- No exact numerical cat count is present anywhere in the public experience.
- No cohabitation-agreement reference or implication remains.
- Promise, reliance, betrayal, abuse, medical danger, the role of the cats, deadline, timeline, budget, media section, transparency, and final appeal are all present.
- No new factual allegation has been invented.

## Dynamic data

- No raw `{{...}}` token is visible.
- Donation totals remain connected to the existing authoritative source.
- Supporter counts remain connected to actual financial-supporter data or are omitted.
- Countdown uses `America/Phoenix`, correct singular/plural grammar, and never becomes negative.
- Historical dates and fixed financial-plan figures remain unchanged.

## Functionality

- Every donation amount control works.
- Every payment option works.
- `CONTINUE TO PAYMENT` works.
- Practical-support submission/handoff works.
- Contact, media, share, copy-link, and PDF actions work.
- Analytics events and security attributes remain intact.

## Visual and responsive

- Campaign colors match the specified palette.
- Burgundy is reserved for urgency and primary action.
- Hero photo is authentic, tightly focused, and responsive.
- No horizontal overflow occurs at 320px.
- Text remains readable and forms remain usable at 200% zoom.
- Layout works on modern mobile, tablet, and desktop viewports.

## Accessibility

- One `<h1>` and logical heading hierarchy.
- Keyboard access and visible focus for all controls.
- Meaningful alt text without a numerical cat count.
- Form labels, error identification, and status announcements are accessible.
- Color contrast passes WCAG 2.2 AA.
- Reduced-motion preferences are respected.

## Trust and privacy

- No invented social proof, donations, endorsements, medical credentials, or press coverage.
- No unredacted private information is exposed.
- Personal-fundraiser and tax-deductibility disclosures remain visible.
- Cash and in-kind support remain clearly distinguished.

---

# 16. REQUIRED FINAL QA SEARCHES

Before deployment, search the full rendered source, component source, metadata, JSON-LD, alt text, aria labels, and share strings for each of these and resolve every unintended match:

```text
cohabitation
co-habitation
27 cats
twenty-seven cats
26 days
$0 raised
0 financial supporters
internal instruction
text-replacement-
{{
}}
```

Also search for any other exact numerical cat count that may have existed in the original site.

Then confirm these required phrases/actions are present and working:

```text
PROTECT SASCHA AND KEEP OUR FAMILY TOGETHER
CONTINUE TO PAYMENT
OFFER PRACTICAL SUPPORT
MEDIA AND PRESS CONTACT
READ THE SUPPORTING MEDICAL BACKGROUND
OUR PROMISE OF TRANSPARENCY
```

---

# 17. COMPLETION REPORT

When finished, report back with:

- Files/components changed
- Copy sections implemented
- Dynamic tokens and data sources used
- Functional flows tested
- Accessibility checks completed
- Responsive viewports tested
- Prohibited-term search results
- Any item that could not be completed and the exact reason

Do not report completion merely because the page compiles. Completion requires passing the acceptance criteria above.
