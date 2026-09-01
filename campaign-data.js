// Miracle Fund campaign facts used by the website and campaign content.
// Update verified figures here first so every dynamic display stays aligned.
window.MIRACLE_FUND_CAMPAIGN = Object.freeze({
  historicalSupport: 6275.23,
  longTermGoal: 500000,
  stabilizationGoal: 25000,
  donors: 25,
  launched: "2026-08-04",
  organizerEmail: "home@withthecats.org",
  campaignUrl: "https://miraclefund.withthecats.org/",
  moveOutDeadline: "2026-09-01T06:59:00Z",
  mortgageSprint: Object.freeze({
    raised: 0,
    goal: 8106.17,
    deadlineLabel: "September 4, 2026",
    asOfLabel: "August 31, 2026",
    note: "The August 18 written amount was $8,028.12. A new $78.05 late fee increased the current exact target to $8,106.17."
  }),
  amazonWishlist: "https://www.amazon.com/hz/wishlist/ls/31DEZVLJU2LGI?ref_=wl_share",
  payments: Object.freeze([
    Object.freeze({ name: "Payment cards", icon: "Card", detail: "Secure checkout", url: "https://donate.stripe.com/fZu3cwcgrebradR2rxbV600" }),
    Object.freeze({ name: "PayPal", icon: "P", detail: "PayPal.Me / gemmaserenity", url: "https://paypal.com/paypalme/gemmaserenity" }),
    Object.freeze({ name: "Venmo", icon: "V", detail: "@Gemma-Gorokhoff · confirmation phone: 520-233-9602", url: "https://venmo.com/u/Gemma-Gorokhoff" }),
    Object.freeze({ name: "Cash App", icon: "$", detail: "$themanifestingqueen", url: "https://cash.app/$themanifestingqueen" }),
    Object.freeze({ name: "Chime", icon: "C", detail: "Search $Gemma-Gorokhoff in Pay Anyone", url: "https://www.chime.com/" })
  ]),
  supportOptions: Object.freeze([
    Object.freeze({ name: "Amazon Wishlist", icon: "A", detail: "Send something urgently needed", wishlist: true }),
    Object.freeze({ name: "Offer skills or knowledge", icon: "S", detail: "Professional, technical, creative, or practical help", type: "Skills or knowledge" }),
    Object.freeze({ name: "Make a connection", icon: "C", detail: "Introduce a person or organization that may help", type: "Connection or referral" }),
    Object.freeze({ name: "Reach out on our behalf", icon: "R", detail: "Contact a relevant organization or advocate", type: "Outreach on our behalf" }),
    Object.freeze({ name: "Pray or check in", icon: "P", detail: "Prayer, encouragement, and steady human presence", type: "Prayer, encouragement, or check-in" })
  ])
});
