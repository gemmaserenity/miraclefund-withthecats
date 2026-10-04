const form = document.querySelector("#contact-form");
const status = document.querySelector("#form-status");
const submitButton = form.querySelector('button[type="submit"]');
const message = form.elements.message;
const messageCount = document.querySelector("#message-count");
const attachment = document.querySelector("#attachment");
const submissionId = document.querySelector("#submission-id");

function newSubmissionId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map(byte => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

submissionId.value = newSubmissionId();

message.addEventListener("input", () => {
  messageCount.textContent = message.value.length.toLocaleString();
});

attachment.addEventListener("change", () => {
  const file = attachment.files[0];
  if (file && file.size > 5 * 1024 * 1024) {
    attachment.setCustomValidity("Please choose a file smaller than 5 MB.");
  } else {
    attachment.setCustomValidity("");
  }
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  status.className = "form-status";
  status.textContent = "";

  if (!form.reportValidity()) return;

  submitButton.disabled = true;
  submitButton.textContent = "Sending…";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(result.error || "Your message could not be sent. Please try again.");

    form.reset();
    messageCount.textContent = "0";
    submissionId.value = newSubmissionId();
    status.className = "form-status is-success";
    status.textContent = "Your message was sent. A confirmation copy is on its way to your inbox.";
    status.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    status.className = "form-status is-error";
    status.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send message";
  }
});
