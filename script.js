const campaign = {
  raised: 0,
  goal: 25000,
  donors: 0,
  launched: "2026-08-04",
  organizerEmail: "campaign@example.com",
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
  ]
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dialog = document.querySelector("#donate-dialog");
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

function openDonation(amount) {
  if (amount) amountInput.value = amount;
  dialog.showModal();
  requestAnimationFrame(() => amountInput.focus());
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

document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});

document.querySelectorAll(".js-share").forEach(button => button.addEventListener("click", async () => {
  const shareData = { title: document.title, text: "Please read and share our family fundraiser.", url: window.location.href };
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

renderCampaign();
renderPaymentOptions();
