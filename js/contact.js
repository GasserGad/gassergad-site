/* =========================================================
   Contact: copy the email address, and the "Write me" composer.
   The composer never sends anything itself. It opens the visitor's own
   Gmail, Outlook or mail app with the email already filled in.
   ========================================================= */
(() => {
  const EMAIL = "hello@gassergad.com";
  const START = "Hi Gasser,\n\n";                    // what the message box starts with
  const FALLBACK_SUBJECT = "Hello from gassergad.com"; // used if they leave the subject empty

  const $ = (s) => document.querySelector(s);
  const toastEl = $("#toast");
  let toastT;
  const toast = (t) => { if (!toastEl) return; toastEl.textContent = t; toastEl.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("on"), 2200); };

  /* copy */
  const copyBtn = $("#copy"), label = copyBtn && copyBtn.querySelector("span");
  async function copy() {
    try { await navigator.clipboard.writeText(EMAIL); }
    catch (e) { // older browsers
      const t = document.createElement("textarea"); t.value = EMAIL; t.style.position = "fixed"; t.style.opacity = "0"; document.body.append(t); t.select();
      try { document.execCommand("copy"); } catch (e2) { toast(EMAIL); return; } finally { t.remove(); }
    }
    if (label) { label.textContent = "Copied"; setTimeout(() => (label.textContent = "Copy"), 1800); }
    toast("Email copied: " + EMAIL);
  }
  copyBtn && copyBtn.addEventListener("click", copy);
  const addr = $("#mailAddr"); // clicking the address itself copies it too
  addr && addr.addEventListener("click", (e) => { e.preventDefault(); copy(); });

  /* composer */
  const form = $("#compose"), open = $("#composeBtn"), sub = $("#cfSub"), body = $("#cfBody");
  if (!form) return;
  body.value = START;
  const reduce = false;

  function show(on) {
    open.setAttribute("aria-expanded", on);
    if (on) {
      form.hidden = false;
      if (window.gsap && !reduce) gsap.fromTo(form, { height: 0, opacity: 0, y: -10 }, { height: "auto", opacity: 1, y: 0, duration: 0.6, ease: "expo.out", clearProps: "height" });
      setTimeout(() => sub.focus({ preventScroll: true }), 50);
      window.ScrollTrigger && setTimeout(() => ScrollTrigger.refresh(), 650);
    } else if (window.gsap && !reduce) {
      gsap.to(form, { height: 0, opacity: 0, duration: 0.35, ease: "power2.in", onComplete: () => { form.hidden = true; gsap.set(form, { clearProps: "all" }); window.ScrollTrigger && ScrollTrigger.refresh(); } });
    } else form.hidden = true;
  }
  open.addEventListener("click", () => show(form.hidden));

  function link(via) {
    const s = sub.value.trim() || FALLBACK_SUBJECT, b = body.value, e = encodeURIComponent;
    if (via === "gmail") return `https://mail.google.com/mail/?view=cm&fs=1&to=${e(EMAIL)}&su=${e(s)}&body=${e(b)}`;
    if (via === "outlook") return `https://outlook.live.com/mail/0/deeplink/compose?to=${e(EMAIL)}&subject=${e(s)}&body=${e(b)}`;
    return `mailto:${EMAIL}?subject=${e(s)}&body=${e(b)}`;
  }
  function go(via) {
    const url = link(via);
    if (via === "mail") location.href = url; else window.open(url, "_blank", "noopener");
    toast(via === "mail" ? "Opening your mail app…" : "Opening " + (via === "gmail" ? "Gmail" : "Outlook") + "…");
  }
  form.addEventListener("submit", (e) => { e.preventDefault(); go("gmail"); });
  form.querySelectorAll('button[type="button"][data-via]').forEach((b) => b.addEventListener("click", () => go(b.dataset.via)));
})();
