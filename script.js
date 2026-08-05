const campaign = {
  raised: 5470,
  goal: 500000,
  firstMilestone: 25000,
  donors: 20,
  launched: "2026-08-04",
  deadline: "2026-08-31",
  organizerEmail: "home@withthecats.org",
  amazonWishlist: "https://www.amazon.com/hz/wishlist/ls/REPLACE_ME",
  payments: [
    { name: "PayPal", icon: "P", detail: "PayPal.Me", url: "https://paypal.me/REPLACE_ME" },
    { name: "Venmo", icon: "V", detail: "@REPLACE_ME", url: "https://venmo.com/u/REPLACE_ME" },
    { name: "Cash App", icon: "$", detail: "$REPLACE_ME", url: "https://cash.app/$REPLACE_ME" },
    { name: "Zelle", icon: "Z", detail: "Verified email or phone", contact: true },
    { name: "Chime", icon: "C", detail: "$REPLACE_ME", url: "https://chime.com/pay/REPLACE_ME" },
    { name: "SoFi", icon: "S", detail: "Direct payment details", contact: true },
    { name: "Wise", icon: "W", detail: "International transfer", url: "https://wise.com/pay/me/REPLACE_ME" },
    { name: "ACH / wire", icon: "⇄", detail: "Request secure bank instructions", contact: true },
    { name: "Cash / check", icon: "¤", detail: "Arrange with the organizer", contact: true }
  ],
  supportOptions: [
    { name: "Amazon Wishlist", icon: "A", detail: "Send an item we currently need", wishlist: true },
    { name: "Gift cards", icon: "G", detail: "Amazon, Fry’s, Petco, or another store", type: "Gift card" },
    { name: "Goods & supplies", icon: "□", detail: "Offer food, cat care, or household items", type: "Goods or supplies" },
    { name: "Prayer", icon: "♡", detail: "Send prayer, encouragement, or intention", type: "Prayer and encouragement" },
    { name: "Time & skills", icon: "T", detail: "Offer professional or practical help", type: "Time or skills" },
    { name: "Transportation", icon: "→", detail: "Help with rides, delivery, or moving", type: "Transportation" },
    { name: "Other", icon: "+", detail: "Tell us another way you can help", type: "Other support" }
  ]
};

const supporters = [
  { initials: "L. L.", gifts: [["2026-04-15", 25], ["2026-04-15", 25]] },
  { initials: "B. C.", gifts: [["2026-04-24", 200]] },
  { initials: "R. L.", gifts: [["2026-05-04", 250], ["2026-06-06", 200], ["2026-06-20", 50]] },
  { initials: "B. C.", gifts: [["2026-05-05", 250]] },
  { initials: "D. H.", gifts: [["2026-05-17", 500], ["2026-05-17", 500], ["2026-05-17", 150], ["2026-05-28", 500], ["2026-07-30", 200], ["2026-07-31", 285], ["2026-07-31", 500]] },
  { initials: "J. F.", gifts: [["2026-05-18", 100]] },
  { initials: "M. H.", gifts: [["2026-06-01", 50]] },
  { initials: "B. S.", gifts: [["2026-06-07", 50]] },
  { initials: "M. P.", gifts: [["2026-06-10", 50], ["2026-06-20", 60]] },
  { initials: "R. M.", gifts: [["2026-06-15", 60], ["2026-07-10", 220]] },
  { initials: "J. M.", gifts: [["2026-06-15", 100]] },
  { initials: "D. W.", gifts: [["2026-06-20", 50], ["2026-07-10", 40]] },
  { initials: "D. B.", gifts: [["2026-06-25", 200]] },
  { initials: "B. F.", gifts: [["2026-07-05", 25]] },
  { initials: "H. W.", gifts: [["2026-07-10", 30], ["2026-07-13", 220]] },
  { initials: "J. S.", gifts: [["2026-07-13", 250]] },
  { initials: "B. P.", gifts: [["2026-07-15", 50]] },
  { initials: "A. M.", gifts: [["2026-07-22", 180]] },
  { initials: "C.", gifts: [["2026-07-25", 50]] },
  { initials: "B. & H.", gifts: [["2026-07-31", 50]] }
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dialog = document.querySelector("#donate-dialog");
const supportDialog = document.querySelector("#support-dialog");
const amountInput = document.querySelector("#donation-amount");
const toast = document.querySelector(".toast");

function renderCampaign() {
  document.querySelectorAll("[data-raised]").forEach(el => el.textContent = money.format(campaign.raised));
  document.querySelectorAll("[data-goal]").forEach(el => el.textContent = money.format(campaign.goal));
  document.querySelectorAll("[data-donor-count]").forEach(el => el.textContent = campaign.donors.toLocaleString());
  const percent = campaign.goal > 0 ? Math.min(100, (campaign.raised / campaign.goal) * 100) : 0;
  document.querySelectorAll(".progress-fill").forEach(el => el.style.width = `${percent}%`);
  document.querySelectorAll(".progress").forEach(el => {
    el.setAttribute("aria-valuemax", campaign.goal);
    el.setAttribute("aria-valuenow", campaign.raised);
  });

  const phoenixParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Phoenix",
    year: "numeric",
    month: "numeric",
    day: "numeric"
  }).formatToParts(new Date());
  const datePart = type => Number(phoenixParts.find(part => part.type === type).value);
  const today = Date.UTC(datePart("year"), datePart("month") - 1, datePart("day"));
  const deadline = Date.UTC(2026, 7, 31);
  const daysLeft = Math.max(0, Math.ceil((deadline - today) / 86400000));
  document.querySelectorAll("[data-days-left]").forEach(el => el.textContent = daysLeft.toLocaleString());
  document.querySelectorAll("[data-deadline-copy]").forEach(el => {
    el.textContent = daysLeft > 0 ? `${daysLeft} days until the stated deadline` : "The stated deadline has arrived";
  });
}

function renderSupporters() {
  const track = document.querySelector("#supporter-track");
  const dateFormat = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
  const contributions = supporters
    .flatMap((supporter, supporterOrder) => supporter.gifts.map(([date, amount], giftOrder) => ({
      initials: supporter.initials, date, amount, supporterOrder, giftOrder
    })))
    .sort((a, b) => a.date.localeCompare(b.date) || a.supporterOrder - b.supporterOrder || a.giftOrder - b.giftOrder);
  const cards = contributions.map(contribution => {
    return `<article class="supporter-card">
      <span class="supporter-initials">${contribution.initials}</span>
      <div class="supporter-gift"><strong>${money.format(contribution.amount)}</strong><time datetime="${contribution.date}">${dateFormat.format(new Date(`${contribution.date}T00:00:00Z`))}</time></div>
    </article>`;
  }).join("");
  track.innerHTML = `<div class="supporter-set">${cards}</div><div class="supporter-set" aria-hidden="true">${cards}</div>`;
}

function renderPaymentOptions() {
  const container = document.querySelector("#payment-options");
  container.innerHTML = campaign.payments.map(payment => {
    const attrs = payment.contact
      ? `href="mailto:${campaign.organizerEmail}?subject=${encodeURIComponent(`${payment.name} donation instructions`)}"`
      : `href="${payment.url}" target="_blank" rel="noopener noreferrer" data-payment-link`;
    return `<a class="payment-option" ${attrs}>
      <span class="payment-icon" aria-hidden="true">${payment.icon}</span>
      <span><strong>${payment.name}</strong><small>${payment.detail}</small></span>
      <span class="arrow" aria-hidden="true">→</span>
    </a>`;
  }).join("");
}

function renderSupportOptions() {
  const container = document.querySelector("#support-options");
  container.innerHTML = campaign.supportOptions.map(option => {
    if (option.wishlist) {
      return `<a class="payment-option support-option" href="${campaign.amazonWishlist}" target="_blank" rel="noopener noreferrer" data-support-link>
        <span class="payment-icon" aria-hidden="true">${option.icon}</span>
        <span><strong>${option.name}</strong><small>${option.detail}</small></span>
        <span class="arrow" aria-hidden="true">→</span>
      </a>`;
    }
    return `<button class="payment-option support-option js-support" type="button" data-support-type="${option.type}">
      <span class="payment-icon" aria-hidden="true">${option.icon}</span>
      <span><strong>${option.name}</strong><small>${option.detail}</small></span>
      <span class="arrow" aria-hidden="true">→</span>
    </button>`;
  }).join("");
}

function openDonation(amount) {
  if (amount) amountInput.value = amount;
  dialog.showModal();
  requestAnimationFrame(() => amountInput.focus());
}

function openSupport(type) {
  if (dialog.open) dialog.close();
  document.querySelector("#support-type").value = type || "Other support";
  supportDialog.showModal();
  requestAnimationFrame(() => document.querySelector("#support-description").focus());
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2800);
}

document.querySelectorAll(".js-donate").forEach(button => button.addEventListener("click", () => openDonation()));
document.querySelectorAll(".js-gift").forEach(button => button.addEventListener("click", () => openDonation(button.dataset.amount)));
document.querySelectorAll("[data-set-amount]").forEach(button => button.addEventListener("click", () => {
  amountInput.value = button.dataset.setAmount;
  amountInput.focus();
}));

document.querySelector("#donate-close").addEventListener("click", () => dialog.close());
document.querySelector("#support-close").addEventListener("click", () => supportDialog.close());
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});
supportDialog.addEventListener("click", event => {
  if (event.target === supportDialog) supportDialog.close();
});

document.querySelector("#support-options").addEventListener("click", event => {
  const button = event.target.closest(".js-support");
  if (button) openSupport(button.dataset.supportType);
});

document.querySelector("#support-form").addEventListener("submit", event => {
  event.preventDefault();
  if (campaign.organizerEmail.includes("example.com")) {
    showToast("The campaign email still needs to be configured");
    return;
  }
  const type = document.querySelector("#support-type").value;
  const estimate = document.querySelector("#support-estimate").value;
  const description = document.querySelector("#support-description").value.trim();
  const name = document.querySelector("#support-name").value.trim() || "Not provided";
  const email = document.querySelector("#support-email").value.trim() || "Not provided";
  const recognition = document.querySelector("#support-recognition").value;
  const body = [
    `Type of support: ${type}`,
    `Estimated value: ${estimate ? money.format(Number(estimate)) : "Not provided"}`,
    `Offer: ${description}`,
    `Name: ${name}`,
    `Reply email: ${email}`,
    `Recognition preference: ${recognition}`
  ].join("\n\n");
  window.location.href = `mailto:${campaign.organizerEmail}?subject=${encodeURIComponent(`${type} offer for With the Cats`)}&body=${encodeURIComponent(body)}`;
});

document.querySelectorAll(".js-share").forEach(button => button.addEventListener("click", async () => {
  const shareData = { title: document.title, text: "We have been told to vacate by August 31. Please help us secure a permanent home and keep our family of cats together.", url: window.location.href };
  try {
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Campaign link copied");
    }
  } catch (error) {
    if (error.name !== "AbortError") showToast("Copy the page address to share");
  }
}));

document.addEventListener("click", event => {
  const link = event.target.closest("[data-payment-link]");
  if (!link) return;
  if (link.href.includes("REPLACE_ME")) {
    event.preventDefault();
    showToast("This payment link still needs to be configured");
  }
});

document.addEventListener("click", event => {
  const link = event.target.closest("[data-support-link]");
  if (link?.href.includes("REPLACE_ME")) {
    event.preventDefault();
    showToast("The Amazon Wishlist link still needs to be configured");
  }
});

renderCampaign();
renderSupporters();
renderPaymentOptions();
renderSupportOptions();
