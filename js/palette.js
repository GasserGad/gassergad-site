/* =========================================================
   Command palette. Opens with Ctrl+K / ⌘K or the Search button in the nav.
   To add a command, add a line to COMMANDS:
     [group, label, icon, hint, action]
   action is a function, a "#section" to scroll to, or a URL to open.
   ========================================================= */
(() => {
  const EMAIL = "hello@gassergad.com";
  const RESUME = "assets/gasser-gadabdelkader-resume.pdf";

  const COMMANDS = [
    ["Navigate", "Go to about", "go", "01", "#about"],
    ["Navigate", "Go to work", "go", "02", "#work"],
    ["Navigate", "Go to stack", "go", "03", "#stack"],
    ["Navigate", "Go to journey", "go", "04", "#journey"],
    ["Navigate", "Go to contact", "go", "05", "#contact"],
    ["Projects", "Open CompenStation", "box", "live app", "https://compenstation.gassergad.com"],
    ["Projects", "Open CS2 H2H", "box", "live app", "https://h2h.gassergad.com"],
    ["Projects", "CompenStation code", "code", "GitHub", "https://github.com/GasserGad/CompenStation"],
    ["Projects", "CS2 H2H code", "code", "GitHub", "https://github.com/GasserGad/cs2-faceit-comparison-tool"],
    ["Actions", "Copy email address", "copy", EMAIL, copyEmail],
    ["Actions", "Email me", "mail", "mailto", "mailto:" + EMAIL],
    ["Actions", "Download resume", "file", "PDF", downloadResume],
    ["Actions", "Check if my apps are up", "bolt", "ping", checkApps],
    ["Links", "GitHub", "link", "GasserGad", "https://github.com/GasserGad"],
    ["Links", "LinkedIn", "link", "in/gasser-gadabdelkader", "https://www.linkedin.com/in/gasser-gadabdelkader"],
  ];

  const ICONS = {
    go: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    box: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>',
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    file: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  };

  const $ = (s) => document.querySelector(s);
  const ov = $("#pal"), q = $("#palQ"), res = $("#palRes"), toastEl = $("#toast"), btn = $("#kbtn");
  if (!ov) return;
  const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  document.querySelectorAll(".mod").forEach((k) => (k.textContent = mac ? "⌘" : "Ctrl"));

  let sel = 0, shown = [], lastFocus = null, toastT;

  function toast(t) { toastEl.textContent = t; toastEl.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("on"), 2400); }
  async function copyEmail() { try { await navigator.clipboard.writeText(EMAIL); toast("Email copied: " + EMAIL); } catch (e) { toast(EMAIL); } }
  function downloadResume() { const a = document.createElement("a"); a.href = RESUME; a.download = ""; document.body.appendChild(a); a.click(); a.remove(); toast("Downloading resume…"); }
  async function checkApps() {
    toast("Checking…");
    const ping = async (name, url) => { const t0 = performance.now(); try { const r = await fetch(url, { cache: "no-store" }); if (!r.ok) throw 0; return `${name}: up (${Math.round(performance.now() - t0)} ms)`; } catch (e) { return `${name}: no answer`; } };
    const out = await Promise.all([ping("CompenStation", "/status/compenstation"), ping("CS2 H2H", "/status/h2h")]);
    toast(out.join(" · "));
  }

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function render() {
    const words = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    shown = COMMANDS.filter((c) => { const hay = (c[1] + " " + c[0] + " " + c[3]).toLowerCase(); return words.every((w) => hay.includes(w)); });
    if (sel >= shown.length) sel = 0;
    if (!shown.length) { res.innerHTML = `<p class="pal-empty">No results for "${esc(q.value)}". Try "email" or "h2h".</p>`; return; }
    let g = "", h = "";
    shown.forEach((c, i) => {
      if (c[0] !== g) { g = c[0]; h += `<div class="pal-grp">${g}</div>`; }
      h += `<div class="pal-it${i === sel ? " sel" : ""}" role="option" aria-selected="${i === sel}" data-i="${i}"><span class="pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[c[2]]}</svg></span>${esc(c[1])}<small>${esc(c[3])}</small></div>`;
    });
    res.innerHTML = h;
    res.querySelectorAll(".pal-it").forEach((el) => {
      el.addEventListener("mousemove", () => { if (sel !== +el.dataset.i) { sel = +el.dataset.i; mark(); } });
      el.addEventListener("click", () => run(shown[+el.dataset.i]));
    });
  }
  function mark() { res.querySelectorAll(".pal-it").forEach((el) => { const on = +el.dataset.i === sel; el.classList.toggle("sel", on); el.setAttribute("aria-selected", on); }); const s = res.querySelector(".sel"); s && s.scrollIntoView({ block: "nearest" }); }

  function run(c) {
    close();
    const a = c[4];
    if (typeof a === "function") return a();
    if (a.startsWith("#")) { const t = $(a); if (!t) return; requestAnimationFrame(() => (window.__lenis ? window.__lenis.scrollTo(t, { offset: -20 }) : t.scrollIntoView({ behavior: "smooth" }))); return; }
    if (a.startsWith("mailto:")) { location.href = a; return; }
    window.open(a, "_blank", "noopener");
  }
  function open() { lastFocus = document.activeElement; ov.classList.add("on"); q.value = ""; sel = 0; render(); window.__lenis && window.__lenis.stop(); q.focus(); }
  function close() { if (!ov.classList.contains("on")) return; ov.classList.remove("on"); window.__lenis && window.__lenis.start(); lastFocus && lastFocus.focus && lastFocus.focus(); }

  btn && btn.addEventListener("click", open);
  ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
  q.addEventListener("input", () => { sel = 0; render(); });
  addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); ov.classList.contains("on") ? close() : open(); return; }
    if (!ov.classList.contains("on")) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Tab") { e.preventDefault(); q.focus(); } // keep focus inside the palette
    else if (e.key === "ArrowDown" && shown.length) { e.preventDefault(); sel = (sel + 1) % shown.length; mark(); }
    else if (e.key === "ArrowUp" && shown.length) { e.preventDefault(); sel = (sel - 1 + shown.length) % shown.length; mark(); }
    else if (e.key === "Enter" && shown[sel]) { e.preventDefault(); run(shown[sel]); }
  });
})();
