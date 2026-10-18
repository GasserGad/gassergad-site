/* =========================================================
   gassergad.com behavior
   Sections are numbered to match index.html. Safe to tweak numbers
   like particle counts, speeds and durations.
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = false; // full motion for everyone (the site ignores the OS "reduce motion" setting by choice)
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const desktop = () => innerWidth > 1020;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.__lenis = lenis; // used by js/grid.js and js/palette.js
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => { const t = $(a.getAttribute("href")); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -20 }); } }));
  }

  /* ---------- particle core (Three.js) ---------- */
  const canvas = $("#gl");
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" }); } catch (e) { renderer = null; }
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  if (renderer) {
    const N = innerWidth < 700 ? 3600 : 7000;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 9);
    const geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 3), rnd = new Float32Array(N);
    const T = [];
    const rand = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
    // 0 sphere
    T.push(Float32Array.from({ length: N * 3 }, () => 0));
    for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963, R = 2.3 + (rand() - .5) * .12; T[0].set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], i * 3); rnd[i] = rand(); }
    // 1 torus
    T.push(new Float32Array(N * 3));
    for (let i = 0; i < N; i++) { const u = rand() * Math.PI * 2, v = rand() * Math.PI * 2, R = 2.5, r = .55 + rand() * .12; T[1].set([(R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u)], i * 3); }
    // 2 wave field
    T.push(new Float32Array(N * 3));
    const side = Math.ceil(Math.sqrt(N));
    for (let i = 0; i < N; i++) { const gx = (i % side) / side - .5, gz = Math.floor(i / side) / side - .5, x = gx * 12, z = gz * 7; T[2].set([x, Math.sin(x * .7) * .45 + Math.cos(z * 1.1) * .35 - 1.6, z], i * 3); }
    // 3 double helix
    T.push(new Float32Array(N * 3));
    for (let i = 0; i < N; i++) { const t = (i / N) * Math.PI * 10, strand = i % 2 ? Math.PI : 0, rr = 1.25 + (rand() - .5) * .25, y = (i / N) * 7 - 3.5; T[3].set([Math.cos(t + strand) * rr, y, Math.sin(t + strand) * rr], i * 3); }
    // 4 sphere (dense shell + core)
    T.push(new Float32Array(N * 3));
    for (let i = 0; i < N; i++) { const a = rand() * Math.PI * 2, b = Math.acos(2 * rand() - 1), R = i % 5 === 0 ? rand() * 1.2 : 2.1; T[4].set([R * Math.sin(b) * Math.cos(a), R * Math.cos(b), R * Math.sin(b) * Math.sin(a)], i * 3); }
    pos.set(T[0]);
    for (let i = 0; i < N * 3; i++) pos[i] *= 0.05;
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uSize: { value: 2.7 * Math.max(1, Math.min(1.8, innerHeight / 800)) }, uPix: { value: renderer.getPixelRatio() }, uAlpha: { value: 1 } },
      vertexShader: `attribute float aRand; uniform float uTime, uSize, uPix; varying float vR; varying float vD;
        void main(){ vec3 p = position; p += 0.05 * sin(uTime * 1.3 + aRand * 6.2831) * normalize(p + 0.0001);
          vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * uPix * (0.6 + aRand * 1.6) * (6.0 / -mv.z); vR = aRand; vD = -mv.z; }`,
      fragmentShader: `uniform float uAlpha; varying float vR; varying float vD;
        void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d);
          vec3 col = mix(vec3(1.0, 0.42, 0.10), vec3(1.0, 0.86, 0.72), step(0.86, vR));
          col = mix(col, vec3(0.55, 0.56, 0.6), step(0.95, vR));
          float fog = clamp((13.0 - vD) / 7.0, 0.25, 1.0);
          gl_FragColor = vec4(col, a * uAlpha * fog * 0.9); }`
    });
    const pts = new THREE.Points(geo, mat), group = new THREE.Group();
    group.add(pts); scene.add(group);
    const OFF = () => desktop() ? [[2.4, 0.1, 1], [2.6, 0, .55], [0, 0, .4], [3, 0, .45], [0, 0.2, .8]] : [[0, 1.2, .85], [0, 0, .4], [0, 0, .3], [0, 0, .35], [0, 0.4, .55]];
    const shapeEls = $$("[data-shape]");
    function shapeP() {
      const mid = innerHeight * 0.5; let p = 0;
      const tops = shapeEls.map((el) => [+el.dataset.shape, el.getBoundingClientRect().top]);
      for (let i = 0; i < tops.length; i++) { if (tops[i][1] <= mid) { const next = tops[i + 1]; if (next && next[0] !== tops[i][0]) { const t = (mid - tops[i][1]) / Math.max(1, next[1] - tops[i][1]); p = tops[i][0] + Math.min(1, Math.max(0, (t - 0.55) / 0.45)) * (next[0] - tops[i][0]); } else p = tops[i][0]; } }
      return p;
    }
    function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    resize(); addEventListener("resize", resize);
    addEventListener("pointermove", (e) => { mouse.tx = e.clientX / innerWidth - .5; mouse.ty = e.clientY / innerHeight - .5; }, { passive: true });
    const cur = new Float32Array(3); let born = 0, last = performance.now();
    const ease = (t) => t * t * (3 - 2 * t);
    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      mat.uniforms.uTime.value = now / 1000;
      born = Math.min(1, born + dt * 0.6);
      const p = shapeP(), i0 = Math.min(3, Math.floor(p)), f = ease(Math.min(1, p - i0)), A = T[i0], B = T[Math.min(4, i0 + 1)];
      const k = 1 - Math.pow(0.004, dt), grow = 0.05 + 0.95 * ease(born);
      for (let j = 0; j < N * 3; j++) { const t = (A[j] + (B[j] - A[j]) * f) * grow; pos[j] += (t - pos[j]) * k; }
      geo.attributes.position.needsUpdate = true;
      const O = OFF(), oa = O[i0], ob = O[Math.min(4, i0 + 1)];
      for (let j = 0; j < 3; j++) cur[j] = oa[j] + (ob[j] - oa[j]) * f;
      group.position.x += (cur[0] - group.position.x) * 0.06; group.position.y += (cur[1] - group.position.y) * 0.06;
      mat.uniforms.uAlpha.value += (cur[2] - mat.uniforms.uAlpha.value) * 0.06;
      mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
      group.rotation.y += dt * 0.12; // the core always drifts, even with "reduce motion" on
      group.rotation.x = 0.25 + mouse.y * 0.5; pts.rotation.z = mouse.x * 0.35;
      camera.position.x = mouse.x * 0.8; camera.position.y = -mouse.y * 0.5; camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- intro ---------- */
  if (!reduce) {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(".nav", { y: -30, opacity: 0, duration: 1 }, 0.1)
      .from(".h-title .ln > span", { yPercent: 110, duration: 1.3, stagger: 0.09 }, 0.2)
      .from(".r-up", { y: 24, opacity: 0, duration: 1.1, stagger: 0.08 }, 0.55);
  }

  /* counters */
  $$("[data-count]").forEach((el) => {
    const n = +el.dataset.count;
    if (reduce) { el.textContent = n; return; }
    const o = { v: 0 };
    gsap.to(o, { v: n, duration: 2, ease: "power3.out", delay: 1, onUpdate: () => (el.textContent = Math.round(o.v)) });
  });

  /* ---------- about: words light up ---------- */
  const at = $("#aboutTxt"), HL = new Set(["never", "twice,", "stay", "up", "every", "push.", "ship"]);
  at.innerHTML = at.textContent.split(" ").map((w) => `<span class="w${HL.has(w) ? " hl" : ""}">${w}</span>`).join(" ");
  if (!reduce) gsap.to("#aboutTxt .w", { opacity: 1, stagger: 0.12, ease: "none", scrollTrigger: { trigger: "#aboutTxt", start: "top 80%", end: "bottom 45%", scrub: true } });

  /* ---------- work: slider ----------
     The centered card is sharp; the others sit back. Change the feel in LOOK below. */
  (() => {
    const view = $("#wView"), track = $("#track"), cards = $$(".card", track), dots = $("#wDots");
    const prev = $("#wPrev"), next = $("#wNext"), wc = $("#wc");
    const LOOK = { scale: 0.86, opacity: 0.32, blur: 3, turn: 14, duration: 1.1, ease: "expo.out" };
    let at = 0;
    $("#wt").textContent = String(cards.length).padStart(2, "0");
    cards.forEach((c, i) => {
      const d = document.createElement("button"); d.type = "button";
      d.setAttribute("aria-label", "Show " + ($("h3", c) ? $("h3", c).textContent : "project " + (i + 1)));
      d.addEventListener("click", () => go(i)); dots.append(d);
      c.setAttribute("aria-roledescription", "slide");
    });
    const dotEls = [...dots.children];
    const xFor = (i) => view.clientWidth / 2 - (cards[i].offsetLeft + cards[i].offsetWidth / 2);
    function go(i, instant) {
      at = Math.max(0, Math.min(cards.length - 1, i));
      const dur = instant ? 0 : LOOK.duration;
      gsap.to(track, { x: xFor(at), duration: dur, ease: LOOK.ease, overwrite: true });
      cards.forEach((c, j) => {
        const off = j - at, on = off === 0;
        gsap.to(c, { scale: on ? 1 : LOOK.scale, opacity: on ? 1 : LOOK.opacity, rotateY: on ? 0 : -Math.sign(off) * LOOK.turn,
          filter: on ? "blur(0px)" : `blur(${LOOK.blur}px)`, duration: dur, ease: LOOK.ease, overwrite: true });
        c.inert = !on;
      });
      const mock = $(".mock", cards[at]);
      if (mock && !instant) gsap.fromTo(mock, { y: 30, rotateX: 8, opacity: 0.4 }, { y: 0, rotateX: 0, opacity: 1, duration: 1.2, ease: "expo.out", delay: 0.12 });
      dotEls.forEach((d, j) => { d.classList.toggle("on", j === at); d.setAttribute("aria-current", j === at); });
      wc.textContent = String(at + 1).padStart(2, "0");
      prev.disabled = at === 0; next.disabled = at === cards.length - 1;
    }
    prev.addEventListener("click", () => go(at - 1));
    next.addEventListener("click", () => go(at + 1));

    // Arrow keys work while the section is on screen
    let inView = false;
    new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0.4 }).observe(view);
    addEventListener("keydown", (e) => {
      if (!inView || e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA/.test(document.activeElement.tagName) || $(".pal-ov.on")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(at + 1); } else if (e.key === "ArrowLeft") { e.preventDefault(); go(at - 1); }
    });

    // Drag with a mouse, swipe on a phone; click a side card to bring it in
    let sx = 0, sy = 0, x0 = 0, dragging = false, moved = false;
    view.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest("a,button")) return;
      sx = e.clientX; sy = e.clientY; x0 = gsap.getProperty(track, "x"); dragging = true; moved = false;
    });
    addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - sy)) { moved = true; view.classList.add("drag"); }
      if (moved) gsap.set(track, { x: x0 + dx * 0.9 });
    }, { passive: true });
    addEventListener("pointerup", (e) => {
      if (!dragging) return; dragging = false; view.classList.remove("drag");
      const dx = e.clientX - sx;
      if (moved) { go(dx < -60 ? at + 1 : dx > 60 ? at - 1 : at); return; }
      // a plain click on a side card brings it to the center
      const hit = cards.findIndex((c) => { const r = c.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; });
      if (hit >= 0 && hit !== at) go(hit);
    });
    addEventListener("pointercancel", () => { if (dragging) { dragging = false; view.classList.remove("drag"); go(at); } });
    addEventListener("resize", () => go(at, true));
    document.fonts && document.fonts.ready.then(() => go(at, true));
    go(0, true);
  })();
  if (!reduce) gsap.from("#wView", { y: 60, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: "#wView", start: "top 85%" } });

  /* ---------- section reveals ---------- */
  if (!reduce) {
    // Section titles: each word un-blurs in turn (the glass look)
    $$(".s-title, .c-title").forEach((el) => {
      const wrap = (node) => [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) { const f = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; if (/^\s+$/.test(w)) f.append(w); else { const sp = document.createElement("span"); sp.className = "w"; sp.textContent = w; f.append(sp); } }); n.replaceWith(f); }
        else if (n.nodeType === 1) wrap(n);
      });
      wrap(el);
      gsap.from(el.querySelectorAll(".w"), { opacity: 0, filter: "blur(14px)", y: 14, duration: 1, stagger: 0.07, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } });
    });
    gsap.from(".tile", { y: 40, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.07, scrollTrigger: { trigger: "#bento", start: "top 80%" } });
    gsap.to("#tlFill", { scaleY: 1, ease: "none", scrollTrigger: { trigger: "#tl", start: "top 60%", end: "bottom 60%", scrub: true } });
    $$(".ev").forEach((ev) => ScrollTrigger.create({ trigger: ev, start: "top 62%", onEnter: () => ev.classList.add("on"), onLeaveBack: () => ev.classList.remove("on") }));
    gsap.from(".giant", { yPercent: 40, opacity: 0, ease: "none", scrollTrigger: { trigger: "footer", start: "top bottom", end: "bottom bottom", scrub: true } });
  } else $$(".ev").forEach((e) => e.classList.add("on"));
  /* CI checks tick through */
  const cis = $$("#ci li");
  const runCI = () => cis.forEach((li, i) => setTimeout(() => li.classList.add("ok"), 280 * (i + 1)));
  if (reduce) cis.forEach((li) => li.classList.add("ok")); else ScrollTrigger.create({ trigger: "#ci", start: "top 85%", once: true, onEnter: runCI });

  /* ---------- bento spotlight ---------- */
  const bento = $("#bento");
  bento.addEventListener("pointermove", (e) => $$(".tile", bento).forEach((t) => { const r = t.getBoundingClientRect(); t.style.setProperty("--x", e.clientX - r.left + "px"); t.style.setProperty("--y", e.clientY - r.top + "px"); }));

  /* ---------- cursor + magnetic ---------- */
  if (fine && !reduce) {
    document.body.classList.add("has-cur");
    const c = $(".cur"), r = $(".ring"); let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; c.style.transform = `translate(${x}px,${y}px)`; }, { passive: true });
    gsap.ticker.add(() => { rx += (x - rx) * 0.18; ry += (y - ry) * 0.18; r.style.transform = `translate(${rx}px,${ry}px)`; });
    $$("a,button").forEach((el) => { el.addEventListener("pointerenter", () => r.classList.add("big")); el.addEventListener("pointerleave", () => r.classList.remove("big")); });
    $$("[data-mag]").forEach((el) => {
      el.addEventListener("pointermove", (e) => { const b = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - b.left - b.width / 2) * 0.28, y: (e.clientY - b.top - b.height / 2) * 0.35, duration: 0.4, ease: "power3.out" }); });
      el.addEventListener("pointerleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.45)" }));
    });
  }

  /* ---------- live status, clock, copy ---------- */
  $$("[data-status]").forEach((el) => {
    const t0 = performance.now(), lab = $("span", el);
    fetch(el.dataset.status, { cache: "no-store" }).then((r) => { if (!r.ok) throw 0; el.classList.add("up"); lab.textContent = "live · " + Math.round(performance.now() - t0) + " ms"; }).catch(() => { lab.textContent = "live demo"; });
  });
  const clock = $("#clock");
  const tickC = () => (clock.textContent = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }).format(new Date()));
  tickC(); setInterval(tickC, 30000);
  /* copy + email composer live in js/contact.js */

  addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
