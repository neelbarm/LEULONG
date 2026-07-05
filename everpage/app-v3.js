/* ============================================================
   EverPage v3 — "The Living Book"
   Page-turning engine + themes + sound + Wrapped generator.
   Vanilla JS, no dependencies.
   ============================================================ */
(() => {
  "use strict";
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const book = $("#book");
  const pageEls = $$(".page", book).sort((a, b) => +a.dataset.page - +b.dataset.page);
  const TOTAL = pageEls.length;
  const byIndex = (i) => pageEls.find((p) => +p.dataset.page === i);

  /* ---------- CHROME: dots, folio ---------- */
  const dotsWrap = $("#dots"), folioNum = $("#folioNum"), folioTot = $("#folioTot");
  if (folioTot) folioTot.textContent = TOTAL;
  pageEls.forEach((p, i) => {
    const d = document.createElement("i");
    d.addEventListener("click", () => jump(+p.dataset.page));
    dotsWrap.appendChild(d);
  });
  const dotEls = $$("#dots i");
  function updateChrome() {
    dotEls.forEach((d, i) => d.classList.toggle("on", i === cur));
    if (folioNum) folioNum.textContent = cur + 1;
    document.body.classList.toggle("is-closed", cur === 0);
  }

  /* ---------- PAGE ANIMATIONS ---------- */
  function runPageAnims(el) {
    $$(".count", el).forEach((n) => countUp(n, +n.dataset.count));
    const ring = $(".ring-fill", el);
    if (ring) {
      const len = 2 * Math.PI * 52, pct = +ring.dataset.pct / 100;
      ring.style.strokeDasharray = len;
      ring.style.strokeDashoffset = len;
      requestAnimationFrame(() => requestAnimationFrame(() => (ring.style.strokeDashoffset = len * (1 - pct))));
    }
  }
  function countUp(node, target) {
    if (reduce) { node.textContent = fmt(target); return; }
    const dur = 1300, t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      node.textContent = fmt(Math.round(target * e));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  const fmt = (n) => n.toLocaleString("en-US");

  /* ---------- THE PAGE TURN ---------- */
  let cur = 0, animating = false;
  function show(i) {
    pageEls.forEach((p) => {
      const on = +p.dataset.page === i;
      p.hidden = !on;
      p.classList.toggle("showing", on);
      p.style.transform = ""; p.style.zIndex = ""; p.style.boxShadow = ""; p.classList.remove("flip");
    });
    cur = i; runPageAnims(byIndex(i)); updateChrome();
  }
  const isMobile = () => matchMedia("(max-width:820px)").matches;

  function turn(to) {
    to = clamp(to, 0, TOTAL - 1);
    if (animating || to === cur) return;
    const dir = to > cur ? 1 : -1;
    animating = true;
    flipSound(dir);
    const outgoing = byIndex(cur), incoming = byIndex(to);

    // MOBILE: no fixed-box flip — swap pages and fade the new one in, then
    // scroll to the top so the whole page (incl. the phone) is visible.
    if (isMobile()) {
      outgoing.hidden = true; outgoing.classList.remove("showing");
      outgoing.style.transform = ""; outgoing.classList.remove("flip");
      incoming.hidden = false; incoming.classList.add("showing");
      incoming.style.animation = "pageIn .42s both";
      runPageAnims(incoming);
      cur = to; updateChrome();
      scrollTo(0, 0);
      setTimeout(() => { incoming.style.animation = ""; animating = false; }, 440);
      return;
    }

    incoming.hidden = false;
    const SH = "36px 0 60px rgba(0,0,0,.32)";
    if (dir > 0) {
      incoming.style.zIndex = 3; incoming.classList.add("showing"); runPageAnims(incoming);
      outgoing.style.transformOrigin = "left center"; outgoing.style.zIndex = 20;
      void outgoing.offsetWidth;
      outgoing.classList.add("flip");
      outgoing.style.transform = "rotateY(-172deg)"; outgoing.style.boxShadow = SH;
    } else {
      outgoing.style.zIndex = 3;
      incoming.style.transformOrigin = "left center"; incoming.style.zIndex = 20;
      incoming.style.transform = "rotateY(-172deg)";
      void incoming.offsetWidth;
      incoming.classList.add("flip");
      incoming.style.transform = "rotateY(0deg)"; incoming.style.boxShadow = SH;
      incoming.classList.add("showing"); runPageAnims(incoming);
    }
    cur = to; updateChrome();

    const done = () => {
      pageEls.forEach((p) => {
        const on = +p.dataset.page === cur;
        p.classList.remove("flip");
        p.style.transform = ""; p.style.zIndex = ""; p.style.boxShadow = ""; p.style.transformOrigin = "";
        p.hidden = !on;
        if (!on) p.classList.remove("showing");
      });
      animating = false;
    };
    if (reduce) { done(); } else { setTimeout(done, 840); }
  }
  const next = () => turn(cur + 1);
  const prev = () => turn(cur - 1);
  function jump(i) {
    if (i === cur || animating) return;
    // animate one hop for neighbors, else snap
    if (Math.abs(i - cur) === 1) turn(i);
    else show(i);
  }

  /* ---------- NAV: zones, buttons, keys, swipe ---------- */
  $("#startBtn")?.addEventListener("click", next);
  $("#restartBtn")?.addEventListener("click", () => show(0));
  $("#navNext")?.addEventListener("click", next);
  $("#navPrev")?.addEventListener("click", prev);
  $("#btnNext")?.addEventListener("click", next);
  $("#btnPrev")?.addEventListener("click", prev);
  // click a neutral half of the page to turn (buttons/inputs stay clickable)
  book.addEventListener("click", (e) => {
    if (animating) return;
    if (e.target.closest("a,button,input,textarea,label,select,.genre,.swatch,.dots i,.phone,canvas")) return;
    const r = book.getBoundingClientRect();
    ((e.clientX - r.left) / r.width > 0.5) ? next() : prev();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
    else if (e.key === "n" || e.key === "N") toggleNight();
  });
  // swipe
  let sx = 0, sy = 0;
  addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next() : prev());
  }, { passive: true });

  /* ---------- shared state (declared early to avoid TDZ) ---------- */
  let accent = "#7C2020";
  const hexDark = (hex, f = 0.72) => {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };
  const wc = $("#wrapped"), wctx = wc?.getContext("2d");
  const wName = $("#wName");
  const GENRES = ["Literary Fiction", "Sci-Fi", "Romance", "Memoir", "History", "Fantasy", "Thriller"];
  let stats = { books: 24, hours: 61, pages: 7480, streak: 38, genre: "Literary Fiction" };

  /* ---------- NIGHT MODE ---------- */
  const NIGHT_KEY = "everpage_night_v3";
  const toggleNight = (force) => {
    const on = force ?? !document.body.classList.contains("night");
    document.body.classList.toggle("night", on);
    $('meta[name=theme-color]')?.setAttribute("content", on ? "#160f09" : accent);
    try { localStorage.setItem(NIGHT_KEY, on ? "1" : "0"); } catch {}
    drawWrapped();
  };
  $("#lamp")?.addEventListener("click", () => toggleNight());
  try { if (localStorage.getItem(NIGHT_KEY) === "1") toggleNight(true); } catch {}

  /* ---------- GENRE THEMING ---------- */
  const ACCENT_KEY = "everpage_accent_v3";
  function setAccent(hex, save = true) {
    accent = hex;
    const root = document.documentElement.style;
    root.setProperty("--accent", hex);
    root.setProperty("--accent-deep", hexDark(hex, 0.62));
    $("#dots i.on"); // noop
    $$(".swatch").forEach((s) => s.classList.toggle("on", s.dataset.accent === hex));
    if (!document.body.classList.contains("night"))
      $('meta[name=theme-color]')?.setAttribute("content", hex);
    if (save) { try { localStorage.setItem(ACCENT_KEY, hex); } catch {} }
    drawWrapped();
  }
  $$(".swatch").forEach((s) => s.addEventListener("click", () => setAccent(s.dataset.accent)));
  let savedAccent = null;
  try { savedAccent = localStorage.getItem(ACCENT_KEY); } catch {}
  setAccent(savedAccent || "#7C2020", false);

  /* ---------- SOUND (synth page-flip) ---------- */
  let audio = null, soundOn = true;
  const soundBtn = $("#soundBtn");
  const setSoundIcon = () => {
    soundBtn?.querySelector(".ic-on")?.toggleAttribute("hidden", !soundOn);
    soundBtn?.querySelector(".ic-off")?.toggleAttribute("hidden", soundOn);
  };
  try { soundOn = localStorage.getItem("everpage_sound_v3") !== "0"; } catch {}
  setSoundIcon();
  soundBtn?.addEventListener("click", () => {
    soundOn = !soundOn; setSoundIcon();
    try { localStorage.setItem("everpage_sound_v3", soundOn ? "1" : "0"); } catch {}
  });
  function flipSound(dir) {
    if (!soundOn || reduce) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      const dur = 0.26, sr = audio.sampleRate, len = Math.floor(sr * dur);
      const buf = audio.createBuffer(1, len, sr), data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const env = Math.pow(1 - i / len, 2.2);          // decay
        data[i] = (Math.random() * 2 - 1) * env;         // shaped noise = paper whoosh
      }
      const src = audio.createBufferSource(); src.buffer = buf;
      const bp = audio.createBiquadFilter(); bp.type = "bandpass";
      bp.frequency.setValueAtTime(900, audio.currentTime);
      bp.frequency.exponentialRampToValueAtTime(2600, audio.currentTime + dur);
      bp.Q.value = 0.8;
      const g = audio.createGain(); g.gain.value = 0.16;
      const pan = audio.createStereoPanner ? audio.createStereoPanner() : null;
      if (pan) pan.pan.value = dir > 0 ? 0.4 : -0.4;
      src.connect(bp); bp.connect(g); (pan ? (g.connect(pan), pan) : g).connect(audio.destination);
      src.start();
    } catch {}
  }

  /* ---------- WRAPPED GENERATOR ---------- */
  function shuffleStats() {
    const r = (a, b) => Math.floor(a + Math.random() * (b - a));
    stats = { books: r(8, 60), hours: r(30, 140), pages: r(2500, 14000), streak: r(12, 120), genre: GENRES[r(0, GENRES.length)] };
    drawWrapped();
  }
  function drawWrapped() {
    if (!wctx) return;
    const W = wc.width, H = wc.height;
    const night = document.body.classList.contains("night");
    const a = accent, ad = hexDark(a, 0.45);
    const g = wctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, a); g.addColorStop(1, night ? "#140d07" : ad);
    wctx.fillStyle = g; wctx.fillRect(0, 0, W, H);
    // soft vignette
    const rg = wctx.createRadialGradient(W / 2, H * 0.32, 40, W / 2, H * 0.32, H);
    rg.addColorStop(0, "rgba(255,220,160,.18)"); rg.addColorStop(1, "rgba(0,0,0,0)");
    wctx.fillStyle = rg; wctx.fillRect(0, 0, W, H);
    wctx.textAlign = "center"; wctx.fillStyle = "rgba(243,230,207,.85)";
    wctx.font = "600 20px Inter, system-ui, sans-serif";
    wctx.fillText("E V E R P A G E   ·   2 0 2 6   W R A P P E D", W / 2, 64);
    const name = (wName?.value || "Reader").trim() || "Reader";
    wctx.fillStyle = "#f6efd9";
    wctx.font = "900 " + (name.length > 10 ? 46 : 60) + "px Fraunces, Georgia, serif";
    wctx.fillText(name.length > 16 ? name.slice(0, 16) : name, W / 2, 140);
    wctx.fillStyle = "rgba(243,230,207,.7)"; wctx.font = "italic 20px Fraunces, Georgia, serif";
    wctx.fillText("your reading year, in a page", W / 2, 176);
    // stat rows
    const rows = [
      [fmt(stats.books), "books finished"],
      [fmt(stats.hours) + "h", "spent reading"],
      [fmt(stats.pages), "pages turned"],
      [stats.streak + " days", "best streak"],
    ];
    let y = 250;
    rows.forEach(([big, lab]) => {
      wctx.textAlign = "left"; wctx.fillStyle = "#f6efd9";
      wctx.font = "800 40px Fraunces, Georgia, serif"; wctx.fillText(big, 54, y);
      wctx.textAlign = "right"; wctx.fillStyle = "rgba(243,230,207,.72)";
      wctx.font = "500 20px Inter, system-ui, sans-serif"; wctx.fillText(lab, W - 54, y - 6);
      y += 78;
      wctx.strokeStyle = "rgba(243,230,207,.16)"; wctx.beginPath(); wctx.moveTo(54, y - 40); wctx.lineTo(W - 54, y - 40); wctx.stroke();
    });
    // top genre pill
    wctx.textAlign = "center";
    const pill = "TOP GENRE · " + stats.genre.toUpperCase();
    wctx.font = "700 18px Inter, system-ui, sans-serif";
    const pw = wctx.measureText(pill).width + 44;
    wctx.fillStyle = "rgba(246,239,217,.14)";
    roundRect(wctx, W / 2 - pw / 2, y - 6, pw, 42, 21); wctx.fill();
    wctx.fillStyle = "#f6efd9"; wctx.fillText(pill, W / 2, y + 21);
    // footer
    wctx.fillStyle = "rgba(243,230,207,.55)"; wctx.font = "600 16px Inter, system-ui, sans-serif";
    wctx.fillText("everpage · read together, track everything", W / 2, H - 34);
  }
  function roundRect(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  wName?.addEventListener("input", drawWrapped);
  $("#wShuffle")?.addEventListener("click", shuffleStats);
  $("#wDownload")?.addEventListener("click", () => {
    try {
      const a = document.createElement("a");
      a.download = "everpage-wrapped.png"; a.href = wc.toDataURL("image/png"); a.click();
    } catch {}
  });
  // fonts may load after first paint — redraw when ready
  if (document.fonts?.ready) document.fonts.ready.then(drawWrapped);
  drawWrapped();

  /* ---------- CURSOR GLOW + MAGNETIC ---------- */
  if (!reduce && matchMedia("(pointer:fine)").matches) {
    const curEl = $("#cursor");
    document.body.classList.add("has-cursor");
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function follow() { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; if (curEl) curEl.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(follow); })();
    const sel = "a,button,input,.genre,.phone,.swatch,.dots i,.nav-zone";
    document.addEventListener("mouseover", (e) => { if (e.target.closest?.(sel)) curEl?.classList.add("big"); });
    document.addEventListener("mouseout", (e) => { if (e.target.closest?.(sel)) curEl?.classList.remove("big"); });
    $$(".btn,.cta").forEach((b) => {
      b.addEventListener("mousemove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.2}px,${(e.clientY - (r.top + r.height / 2)) * 0.3}px)`;
      });
      b.addEventListener("mouseleave", () => { b.style.transform = ""; });
    });
    // phone parallax
    const tilts = $$("[data-tilt]");
    addEventListener("mousemove", (e) => {
      const cxx = e.clientX / innerWidth - 0.5, cyy = e.clientY / innerHeight - 0.5;
      tilts.forEach((t) => { if (!t.offsetParent) return; t.style.transform = `perspective(900px) rotateY(${cxx * 12}deg) rotateX(${-cyy * 8}deg)`; });
    }, { passive: true });
  }

  /* ---------- BACKGROUND PARTICLES ---------- */
  const fx = $("#fx"), fxc = fx.getContext("2d");
  let W, H, pages = [];
  const rs = () => { W = fx.width = innerWidth * devicePixelRatio; H = fx.height = innerHeight * devicePixelRatio; };
  rs(); addEventListener("resize", () => { rs(); drawWrapped(); });
  const mk = () => ({ x: Math.random() * W, y: Math.random() * H, s: (8 + Math.random() * 14) * devicePixelRatio,
    vy: (0.12 + Math.random() * 0.35) * devicePixelRatio, vx: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
    rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.01, a: 0.04 + Math.random() * 0.1 });
  if (!reduce) {
    pages = Array.from({ length: innerWidth < 640 ? 14 : 30 }, mk);
    (function loop() {
      fxc.clearRect(0, 0, W, H);
      const night = document.body.classList.contains("night");
      pages.forEach((p) => {
        p.y += p.vy; p.x += p.vx; p.rot += p.vr;
        if (p.y - p.s > H) { p.y = -p.s; p.x = Math.random() * W; }
        fxc.save(); fxc.translate(p.x, p.y); fxc.rotate(p.rot);
        fxc.fillStyle = night ? `rgba(255,198,122,${p.a * 1.5})` : `rgba(35,78,82,${p.a})`;
        fxc.fillRect(-p.s / 2, -p.s * 0.7, p.s, p.s * 1.4);
        fxc.restore();
      });
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- WAITLIST + CONFETTI ---------- */
  const KEY = "everpage_waitlist", base = 2014;
  const stored = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const refreshCount = () => { const s = $("#spotCount"); if (s) s.textContent = fmt(base + stored().length); };
  refreshCount();
  $$("[data-join]").forEach((form) => form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("input[type=email]", form), email = (input?.value || "").trim();
    if (!email) return;
    const list = stored(); if (!list.includes(email)) list.push(email);
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
    refreshCount();
    // real capture: email each signup to the EverPage inbox (FormSubmit, no account)
    try {
      fetch("https://formsubmit.co/ajax/everpageofficial@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email,
          _subject: "New EverPage waitlist signup 📖",
          _template: "table",
          _captcha: "false",
        }),
      }).catch(() => {});
    } catch {}
    const wrap = form.closest(".join-inner");
    const success = $(".join-success", wrap), placeEl = $("[data-place]", wrap);
    if (placeEl) placeEl.textContent = "#" + fmt(base + list.length);
    if (success) { success.hidden = false; form.style.display = "none"; }
    burst(innerWidth / 2, innerHeight / 2, 54);
    if (input) input.value = "";
  }));

  const cc = $("#confetti"), cctx = cc.getContext("2d");
  let conf = [], CW, CH, rafc = null;
  const crs = () => { CW = cc.width = innerWidth * devicePixelRatio; CH = cc.height = innerHeight * devicePixelRatio; };
  crs(); addEventListener("resize", crs);
  const pal = ["#7C2020", "#234E52", "#CDB088", "#A9CAD8", "#C88E8E", "#b6924e"];
  function burst(px, py, n) {
    if (reduce) return;
    const dpr = devicePixelRatio;
    for (let i = 0; i < n; i++) conf.push({ x: px * dpr, y: py * dpr, vx: (Math.random() - 0.5) * 9 * dpr,
      vy: (Math.random() * -9 - 3) * dpr, g: 0.28 * dpr, s: (6 + Math.random() * 8) * dpr,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3, c: pal[(Math.random() * pal.length) | 0], life: 1 });
    if (!rafc) rafc = requestAnimationFrame(runConf);
  }
  function runConf() {
    cctx.clearRect(0, 0, CW, CH);
    conf.forEach((p) => {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.008;
      cctx.save(); cctx.translate(p.x, p.y); cctx.rotate(p.rot); cctx.globalAlpha = Math.max(0, p.life);
      cctx.fillStyle = p.c; cctx.fillRect(-p.s / 2, -p.s * 0.7, p.s, p.s * 1.4);
      cctx.fillStyle = "rgba(255,255,255,.7)"; cctx.fillRect(p.s / 2 - p.s * 0.18, -p.s * 0.7, p.s * 0.18, p.s * 1.4);
      cctx.restore();
    });
    conf = conf.filter((p) => p.life > 0 && p.y < CH + 40);
    if (conf.length) rafc = requestAnimationFrame(runConf); else { cctx.clearRect(0, 0, CW, CH); rafc = null; }
  }

  /* ---------- INIT ---------- */
  show(0);
})();
