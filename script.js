const campaign = {
  raised: 6145,
  goal: 500000,
  firstMilestone: 25000,
  donors: 25,
  launched: "2026-08-04",
  deadline: "2026-08-31",
  organizerEmail: "home@withthecats.org",
  amazonWishlist: "https://www.amazon.com/hz/wishlist/ls/31DEZVLJU2LGI?ref_=wl_share",
  payments: [
    { name: "Payment cards", icon: "Card", detail: "Secure checkout", url: "https://donate.stripe.com/fZu3cwcgrebradR2rxbV600" },
    { name: "PayPal", icon: "P", detail: "PayPal.Me / gemmaserenity", url: "https://paypal.com/paypalme/gemmaserenity" },
    { name: "Venmo", icon: "V", detail: "@Gemma-Gorokhoff · confirmation phone: 520-233-9602", url: "https://venmo.com/u/Gemma-Gorokhoff" },
    { name: "Cash App", icon: "$", detail: "$themanifestingqueen", url: "https://cash.app/$themanifestingqueen" },
    { name: "Chime", icon: "C", detail: "Search $Gemma-Gorokhoff in Pay Anyone", url: "https://www.chime.com/" },
  ],
  supportOptions: [
    { name: "Amazon Wishlist", icon: "A", detail: "Send something urgently needed", wishlist: true }
  ]
};

const supporters = [
  { name: "Lisa", gifts: [["2026-04-15", 25], ["2026-04-15", 25]] },
  { name: "Ben", gifts: [["2026-04-24", 200], ["2026-06-07", 50]] },
  { name: "Regina", gifts: [["2026-05-04", 250], ["2026-06-06", 200], ["2026-06-20", 50], ["2026-08-03", 50], ["2026-08-14", 50]] },
  { name: "Brian", gifts: [["2026-05-05", 250]] },
  { name: "Dan", gifts: [["2026-05-17", 500], ["2026-05-17", 500], ["2026-05-17", 150], ["2026-05-28", 500], ["2026-07-30", 200], ["2026-07-31", 285], ["2026-07-31", 500]] },
  { name: "Joe", gifts: [["2026-05-18", 100]] },
  { name: "Mark", gifts: [["2026-06-01", 50]] },
  { name: "Monica", gifts: [["2026-06-10", 50], ["2026-06-20", 60]] },
  { name: "Rod", gifts: [["2026-06-15", 60], ["2026-07-10", 220]] },
  { name: "Jessica", gifts: [["2026-06-15", 100]] },
  { name: "Billie", gifts: [["2026-06-16", 25]] },
  { name: "Darla", gifts: [["2026-06-20", 50], ["2026-07-10", 40]] },
  { name: "Dave", gifts: [["2026-06-25", 200]] },
  { name: "Brenda", gifts: [["2026-07-05", 25]] },
  { name: "Heather", gifts: [["2026-07-10", 30], ["2026-07-13", 20], ["2026-07-13", 200], ["2026-07-21", 10], ["2026-07-27", 20]] },
  { name: "Joelle", gifts: [["2026-07-13", 250]] },
  { name: "Brett", gifts: [["2026-07-15", 50]] },
  { name: "Aziz", gifts: [["2026-07-22", 180], ["2026-08-15", 50]] },
  { name: "Cammi", gifts: [["2026-07-25", 50]] },
  { name: "Red", gifts: [["2026-07-31", 50]] },
  { name: "Kathy", gifts: [["2026-08-09", 100]] },
  { name: "Marialuz", gifts: [["2026-08-11", 200]] },
  { name: "Paul", gifts: [["2026-08-15", 50]] },
  { name: "Jean-Claude", gifts: [["2026-08-17", 100]] },
  { name: "Eric", gifts: [["2026-08-18", 20]] }
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dialog = document.querySelector("#donate-dialog");
const supportDialog = document.querySelector("#support-dialog");
const amountInput = document.querySelector("#donation-amount");
const toast = document.querySelector(".toast");

function renderCampaign() {
  document.querySelectorAll("[data-raised]").forEach(el => el.textContent = money.format(campaign.raised));
  document.querySelectorAll("[data-goal]").forEach(el => el.textContent = money.format(campaign.goal));
  const supporterLabel = campaign.donors > 0 ? `${campaign.donors.toLocaleString()} supporter${campaign.donors === 1 ? "" : "s"}` : "";
  document.querySelectorAll("[data-supporter-label]").forEach(el => {
    el.textContent = supporterLabel;
    if (!supporterLabel) el.hidden = true;
  });
  const percent = campaign.firstMilestone > 0 ? Math.min(100, (campaign.raised / campaign.firstMilestone) * 100) : 0;
  document.querySelectorAll(".progress-fill").forEach(el => el.style.width = `${percent}%`);
  document.querySelectorAll(".progress").forEach(el => {
    el.setAttribute("aria-valuemax", campaign.firstMilestone);
    el.setAttribute("aria-valuenow", campaign.raised);
  });

  const deadline = Date.parse("2026-09-01T06:59:00Z");
  const remaining = Math.max(0, deadline - Date.now());
  let countdownLabel = "The stated deadline has arrived";
  let countdownHeading = "THE STATED DEADLINE HAS ARRIVED";
  if (remaining > 0) {
    const days = Math.floor(remaining / 86400000);
    const hours = Math.max(1, Math.ceil(remaining / 3600000));
    if (days >= 1) {
      countdownLabel = `${days} day${days === 1 ? " remains" : "s remain"}`;
      countdownHeading = `${days} DAY${days === 1 ? " REMAINS" : "S REMAIN"}`;
    } else {
      countdownLabel = `${hours} hour${hours === 1 ? " remains" : "s remain"}`;
      countdownHeading = `${hours} HOUR${hours === 1 ? " REMAINS" : "S REMAIN"}`;
    }
  }
  document.querySelectorAll("[data-countdown-label]").forEach(el => el.textContent = countdownLabel);
  document.querySelectorAll("[data-countdown-heading]").forEach(el => el.textContent = countdownHeading);
}

function renderSupporters() {
  const track = document.querySelector("#supporter-track");
  const dateFormat = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
  const contributions = supporters
    .flatMap((supporter, supporterOrder) => supporter.gifts.map(([date, amount], giftOrder) => ({
      name: supporter.name, date, amount, supporterOrder, giftOrder
    })))
    .sort((a, b) => a.date.localeCompare(b.date) || a.supporterOrder - b.supporterOrder || a.giftOrder - b.giftOrder);
  const cards = contributions.map(contribution => {
    return `<article class="supporter-card">
      <span class="supporter-initials">${contribution.name}</span>
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
  document.querySelector("#support-type").value = type || "Other practical support";
  supportDialog.showModal();
  requestAnimationFrame(() => document.querySelector("#support-description").focus());
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2800);
}

document.querySelectorAll(".js-donate").forEach(button => button.addEventListener("click", () => openDonation()));
document.querySelectorAll(".js-support").forEach(button => button.addEventListener("click", () => openSupport(button.dataset.supportType)));
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

document.querySelector("#continue-payment").addEventListener("click", () => {
  if (!amountInput.value || Number(amountInput.value) < 1) {
    amountInput.setCustomValidity("Please choose or enter a gift amount.");
    amountInput.reportValidity();
    return;
  }
  amountInput.setCustomValidity("");
  document.querySelector("#payment-options a")?.focus();
});

document.querySelector("#support-form").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector('[type="submit"]');
  const type = document.querySelector("#support-type").value;
  const estimate = document.querySelector("#support-estimate").value;
  const description = document.querySelector("#support-description").value.trim();
  const name = document.querySelector("#support-name").value.trim();
  const email = document.querySelector("#support-email").value.trim();
  const recognition = document.querySelector("#support-recognition").value;
  const website = document.querySelector("#support-website").value;

  submitButton.disabled = true;
  submitButton.textContent = "Sending…";

  try {
    const response = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, estimate, description, name, email, recognition, website })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Your message could not be sent.");

    form.reset();
    supportDialog.close();
    showToast("Your private message was sent to Gemma");
  } catch (error) {
    showToast(error.message || "Your message could not be sent. Please try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Prepare private message";
  }
});

const shareText = "A disabled Arizona man and his wife have until August 31 to find safety for themselves and their beloved bonded cat family. After years of family instability and financial sacrifice, they are fighting to keep the animals who help him endure relentless neurological pain. Please read, give, or share.";
const campaignUrl = "https://miraclefund.withthecats.org/";

document.querySelectorAll(".js-share").forEach(button => button.addEventListener("click", async () => {
  const shareData = { title: document.title, text: shareText, url: campaignUrl };
  try {
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(campaignUrl);
      showToast("Campaign link copied");
    }
  } catch (error) {
    if (error.name !== "AbortError") showToast("Copy the page address to share");
  }
}));

document.querySelectorAll("[data-share-platform]").forEach(button => button.addEventListener("click", () => {
  const encodedUrl = encodeURIComponent(campaignUrl);
  const encodedText = encodeURIComponent(shareText);
  const urls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    threads: `https://www.threads.net/intent/post?text=${encodedText}%20${encodedUrl}`,
    x: `https://x.com/intent/post?text=${encodedText}&url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`
  };
  window.open(urls[button.dataset.sharePlatform], "_blank", "noopener,noreferrer");
}));

document.querySelectorAll("[data-copy-link]").forEach(button => button.addEventListener("click", async () => {
  await navigator.clipboard.writeText(campaignUrl);
  showToast("Campaign link copied");
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
