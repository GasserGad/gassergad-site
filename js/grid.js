/* =========================================================
   Grid beams, cursor spotlight and button glow.
   Tweak the numbers in SETTINGS. CELL must match --cell in css/styles.css.
   ========================================================= */
(() => {
  const SETTINGS = {
    CELL: 64,            // grid size in px
    MAX_BEAMS: 8,        // beams on screen at once (desktop)
    MAX_BEAMS_PHONE: 3,  // beams on screen at once (phones / touch)
    SPAWN_MS: 520,       // how often a new beam may start
    TAIL: 150,           // beam length in px
    COLOR: "255,154,92", // beam color (r,g,b)
    HEAD: "#ffd2b0",     // color of the bright dot at the front
  };

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;
  const grid = document.querySelector(".gridbg");
  if (!grid) return;

  /* the grid moves with the page so it feels attached to the content */
  const sy = () => (window.__lenis ? window.__lenis.scroll : scrollY);
  let off = 0;
  const syncGrid = () => { off = -(sy() % SETTINGS.CELL); grid.style.setProperty("--off", off + "px"); };
  syncGrid();
  addEventListener("scroll", syncGrid, { passive: true });

  /* cursor position for the lit grid and the page spotlight */
  if (fine) {
    addEventListener("pointermove", (e) => { root.style.setProperty("--mx", e.clientX + "px"); root.style.setProperty("--my", e.clientY + "px"); }, { passive: true });
    document.addEventListener("pointerleave", () => { root.style.setProperty("--mx", "-999px"); root.style.setProperty("--my", "-999px"); });
  }

  /* buttons light up where the cursor is */
  document.querySelectorAll(".btn").forEach((b) => b.addEventListener("pointermove", (e) => {
    const r = b.getBoundingClientRect();
    b.style.setProperty("--gx", e.clientX - r.left + "px");
    b.style.setProperty("--gy", e.clientY - r.top + "px");
  }));

  /* light pulses running along the grid lines */
  if (reduce) return;
  const c = grid.querySelector("canvas"), x = c.getContext("2d");
  const max = fine ? SETTINGS.MAX_BEAMS : SETTINGS.MAX_BEAMS_PHONE;
  let W, H, dpr, beams = [];
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener("resize", size);

  function spawn() {
    const h = Math.random() < 0.5, dir = Math.random() < 0.5 ? 1 : -1, len = h ? W : H;
    beams.push({
      h, dir,
      line: Math.floor(Math.random() * ((h ? H : W) / SETTINGS.CELL + 1)),
      t: dir > 0 ? -SETTINGS.TAIL : len + SETTINGS.TAIL,
      s: (3 + Math.random() * 4) * dir,
    });
  }
  setInterval(() => { if (!document.hidden && beams.length < max) spawn(); }, SETTINGS.SPAWN_MS);

  function frame() {
    x.clearRect(0, 0, W, H);
    beams = beams.filter((b) => (b.dir > 0 ? b.t < (b.h ? W : H) + SETTINGS.TAIL : b.t > -SETTINGS.TAIL));
    for (const b of beams) {
      b.t += b.s;
      const tail = b.t - SETTINGS.TAIL * b.dir;
      // horizontal beams sit on rows that scroll with the page; vertical ones on fixed columns
      const p = b.h ? b.line * SETTINGS.CELL + off + 0.5 : b.line * SETTINGS.CELL + 0.5;
      const g = b.h ? x.createLinearGradient(tail, 0, b.t, 0) : x.createLinearGradient(0, tail, 0, b.t);
      g.addColorStop(0, `rgba(${SETTINGS.COLOR},0)`);
      g.addColorStop(1, `rgba(${SETTINGS.COLOR},.9)`);
      x.strokeStyle = g; x.lineWidth = 1.5; x.beginPath();
      if (b.h) { x.moveTo(tail, p); x.lineTo(b.t, p); } else { x.moveTo(p, tail); x.lineTo(p, b.t); }
      x.stroke();
      x.fillStyle = SETTINGS.HEAD; x.beginPath();
      x.arc(b.h ? b.t : p, b.h ? p : b.t, 1.8, 0, Math.PI * 2); x.fill();
    }
    requestAnimationFrame(frame); // browsers pause this automatically in hidden tabs
  }
  requestAnimationFrame(frame);
})();
