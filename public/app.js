// Gable: shared behavior for every page.
// Fill in the two settings below before deploying.

const GA_ID = "G-XXXXXXXXXX";   // Google Analytics 4 measurement ID
const FORM_ENDPOINT = "";       // e.g. "https://formspree.io/f/abcdwxyz". Empty = demo mode (skips saving, goes straight to thanks).

const page = document.body.dataset.page || "home";

// ---------- Google Analytics (only loads once a real ID is set) ----------
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
if (!GA_ID.includes("XXXX")) {
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);
  gtag("js", new Date());
  gtag("config", GA_ID);
}

// Keep UTM params so a signup can be traced back to the post that sent it.
const params = new URLSearchParams(location.search);
const utm = {};
["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((k) => {
  if (params.get(k)) utm[k] = params.get(k);
});

// ---------- Scroll reveal ----------
document.documentElement.classList.add("js");
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

// ---------- Top bar border on scroll ----------
const topbar = document.querySelector(".topbar");
if (topbar) {
  const onScroll = () => topbar.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ---------- Segmented toggle ----------
let mode = "";
document.querySelectorAll(".segmented").forEach((group) => {
  const buttons = group.querySelectorAll("button");
  buttons.forEach((b) => {
    if (b.getAttribute("aria-pressed") === "true") mode = b.dataset.mode;
    b.addEventListener("click", () => {
      buttons.forEach((x) => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      mode = b.dataset.mode;
      const ta = document.querySelector(".chat-box textarea");
      if (ta && b.dataset.placeholder) ta.dataset.prompts = b.dataset.placeholder;
      restartTyping();
    });
  });
});

// ---------- Chat box: typing placeholder, chips, submit ----------
const chatForm = document.querySelector(".chat-box");
const textarea = chatForm ? chatForm.querySelector("textarea") : null;
let typingTimer = null;

function restartTyping() {
  if (!textarea) return;
  clearTimeout(typingTimer);
  const prompts = (textarea.dataset.prompts || "").split("|").filter(Boolean);
  if (!prompts.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    textarea.placeholder = prompts[0] || textarea.placeholder;
    return;
  }
  let p = 0, i = 0, deleting = false;
  const tick = () => {
    const text = prompts[p];
    if (!deleting) {
      i++;
      textarea.placeholder = text.slice(0, i);
      if (i === text.length) { deleting = true; typingTimer = setTimeout(tick, 1800); return; }
      typingTimer = setTimeout(tick, 38);
    } else {
      i--;
      textarea.placeholder = text.slice(0, i);
      if (i === 0) { deleting = false; p = (p + 1) % prompts.length; typingTimer = setTimeout(tick, 300); return; }
      typingTimer = setTimeout(tick, 16);
    }
  };
  tick();
}
restartTyping();

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    if (!textarea) return;
    textarea.value = chip.textContent.trim();
    textarea.focus();
  });
});

const modal = document.getElementById("signup-modal");

if (chatForm) {
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); chatForm.requestSubmit(); }
  });
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = textarea.value.trim() || textarea.placeholder.trim();
    gtag("event", "chat_request", { page_variant: page, mode });
    if (modal) {
      modal.querySelector(".echo").textContent = q;
      modal.querySelector('input[name="request"]').value = q;
      modal.showModal();
      modal.querySelector('input[type="email"]').focus();
    }
  });
}

if (modal) {
  modal.querySelector(".modal-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
}

// ---------- Email capture (every .email-form on the page) ----------
document.querySelectorAll(".email-form").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]');
    const err = form.parentElement.querySelector(".form-error");
    if (!email.value || !email.checkValidity()) {
      if (err) err.textContent = "Please enter a valid email address.";
      email.focus();
      return;
    }
    if (err) err.textContent = "";

    const data = {
      email: email.value.trim(),
      source: page,
      mode,
      request: (form.querySelector('input[name="request"]') || {}).value || "",
      ...utm,
    };
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Saving...";

    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("bad status " + res.status);
      }
      location.href = "thanks.html?source=" + encodeURIComponent(page) + (mode ? "&mode=" + encodeURIComponent(mode) : "");
    } catch (ex) {
      btn.disabled = false;
      btn.textContent = "Try again";
      if (err) err.textContent = "Something went wrong saving your email. Please try again.";
    }
  });
});

// ---------- Thanks page: fire the key event ----------
if (page === "thanks") {
  gtag("event", "sign_up", { method: "email", page_variant: params.get("source") || "unknown" });
}
