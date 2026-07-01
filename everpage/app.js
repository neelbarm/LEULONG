/* ============================================================
   EverPage — landing interactions
   Vanilla JS, no dependencies. Everything degrades gracefully.
   ============================================================ */
(() => {
  "use strict";
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- OPEN THE BOOK ---------- */
  const openBook = () => {
    if (document.body.classList.contains("is-open")) return;
    document.body.classList.remove("is-closed");
    document.body.classList.add("is-open");
    // reveal the first spread right away
    setTimeout(() => revealFolio(1), 400);
  };
  $("#openBtn")?.addEventListener("click", openBook);
  $("#cover .book3d")?.addEventListener("click", openBook);

  /* ---------- SCROLL REVEALS ---------- */
  const spreads = $$(".spread, .backcover");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        runSpreadAnimations(e.target);
      }
    });
  }, { threshold: 0.28 });
  spreads.forEach((s) => io.observe(s));

  function revealFolio(n) {
    const t = spreads.find((s) => +s.dataset.folio === n);
    if (t) { t.classList.add("in"); runSpreadAnimations(t); }
  }

  /* ---------- PER-SPREAD ANIMATIONS ---------- */
  const done = new WeakSet();
  function runSpreadAnimations(el) {
    if (done.has(el)) return;
    done.add(el);

    // count-up numbers
    $$(".count", el).forEach((n) => countUp(n, +n.dataset.count));

    // goal ring
    const ring = $(".ring-fill", el);
    if (ring) {
      const pct = +ring.dataset.pct / 100;
      const len = 2 * Math.PI * 52;           // r = 52
      ring.style.strokeDasharray = len;
      requestAnimationFrame(() =>
        (ring.style.strokeDashoffset = len * (1 - pct)));
    }
  }

  function countUp(node, target) {
    if (reduce) { node.textContent = format(target); return; }
    const dur = 1400, t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      node.textContent = format(Math.round(target * eased));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  const format = (n) => n.toLocaleString("en-US");

  /* ---------- FOLIO + RIBBON TRACKING ---------- */
  const folioNum = $("#folioNum");
  const ribbonFill = $(".ribbon-fill");
  const ribbon = $("#ribbon");
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    const p = h > 0 ? scrollY / h : 0;
    if (ribbon) ribbon.style.height = (28 + p * (innerHeight - 60)) + "px";
    // which spread is centered?
    const mid = scrollY + innerHeight / 2;
    let cur = 1;
    spreads.forEach((s) => {
      if (s.offsetTop <= mid) cur = +s.dataset.folio;
    });
    if (folioNum) folioNum.textContent = cur;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- PHONE + POINTER PARALLAX ---------- */
  if (!reduce && matchMedia("(pointer:fine)").matches) {
    const tilts = $$("[data-tilt]");
    addEventListener("mousemove", (e) => {
      const cx = e.clientX / innerWidth - 0.5;
      const cy = e.clientY / innerHeight - 0.5;
      tilts.forEach((t) => {
        const r = t.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        t.style.transform =
          `perspective(900px) rotateY(${cx * 14}deg) rotateX(${-cy * 10}deg) translateZ(6px)`;
      });
    }, { passive: true });
  }

  /* ---------- GENRE CHIP SHUFFLE ---------- */
  const genres = $("[data-genres]");
  if (genres && !reduce) {
    const chips = $$(".genre", genres);
    let i = 0;
    setInterval(() => {
      chips.forEach((c) => c.classList.remove("on"));
      i = (i + 1) % chips.length;
      chips[i].classList.add("on");
    }, 1600);
  }
  // playful "add to shelf" pop
  $("[data-shelf-cta]")?.addEventListener("click", (e) => {
    e.currentTarget.classList.remove("pop");
    void e.currentTarget.offsetWidth;
    e.currentTarget.classList.add("pop");
    burst(e.clientX, e.clientY, 14);
  });

  /* ---------- BACKGROUND FLOATING PAGES ---------- */
  const fx = $("#fx"), fxc = fx.getContext("2d");
  let pages = [], W, H;
  const resize = () => {
    W = fx.width = innerWidth * devicePixelRatio;
    H = fx.height = innerHeight * devicePixelRatio;
  };
  resize(); addEventListener("resize", resize);
  const mkPage = () => ({
    x: Math.random() * W, y: Math.random() * H,
    s: (8 + Math.random() * 16) * devicePixelRatio,
    vy: (0.15 + Math.random() * 0.4) * devicePixelRatio,
    vx: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
    rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.01,
    a: 0.05 + Math.random() * 0.12,
  });
  if (!reduce) {
    pages = Array.from({ length: 34 }, mkPage);
    (function loop() {
      fxc.clearRect(0, 0, W, H);
      pages.forEach((p) => {
        p.y += p.vy; p.x += p.vx; p.rot += p.vr;
        if (p.y - p.s > H) { p.y = -p.s; p.x = Math.random() * W; }
        fxc.save();
        fxc.translate(p.x, p.y); fxc.rotate(p.rot);
        fxc.fillStyle = `rgba(35,78,82,${p.a})`;
        fxc.fillRect(-p.s / 2, -p.s * 0.7, p.s, p.s * 1.4);
        fxc.strokeStyle = `rgba(124,32,32,${p.a * 0.8})`;
        fxc.lineWidth = devicePixelRatio;
        fxc.strokeRect(-p.s / 2, -p.s * 0.7, p.s, p.s * 1.4);
        fxc.restore();
      });
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- WAITLIST FORMS ---------- */
  // Plug a real endpoint here (Formspree / your API). Left null => demo mode.
  const FORM_ENDPOINT = null;
  const KEY = "everpage_waitlist";
  const baseCount = 2014;
  const stored = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const updateCounts = () => {
    const n = baseCount + stored().length;
    const spot = $("#spotCount"); if (spot) spot.textContent = format(n);
  };
  updateCounts();

  $$("[data-join]").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = $("input[type=email]", form);
      const email = (input?.value || "").trim();
      if (!email) return;

      const btn = $("button", form);
      if (btn) { btn.disabled = true; btn.dataset.old = btn.innerHTML; }

      let ok = true;
      if (FORM_ENDPOINT) {
        try {
          const r = await fetch(FORM_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ email }),
          });
          ok = r.ok;
        } catch { ok = false; }
      }

      // remember locally either way (so counts feel alive in demo)
      const list = stored();
      if (!list.includes(email)) list.push(email);
      localStorage.setItem(KEY, JSON.stringify(list));
      updateCounts();

      celebrate(form, baseCount + list.length, e);
      if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.old; }
      if (input) input.value = "";
    });
  });

  function celebrate(form, place, e) {
    // big form on the join page swaps to a success ticket
    const wrap = form.closest(".join-inner");
    if (wrap) {
      const success = $(".join-success", wrap);
      const placeEl = $("[data-place]", wrap);
      if (placeEl) placeEl.textContent = "#" + format(place);
      if (success) { success.hidden = false; form.style.display = "none"; }
    }
    const x = e?.clientX ?? innerWidth / 2;
    const y = e?.clientY ?? innerHeight / 2;
    burst(x, y, 46);
  }

  /* ---------- CONFETTI (little books) ---------- */
  const cc = $("#confetti"), ctx = cc.getContext("2d");
  let confetti = [], CW, CH, rafC = null;
  const cresize = () => { CW = cc.width = innerWidth * devicePixelRatio; CH = cc.height = innerHeight * devicePixelRatio; };
  cresize(); addEventListener("resize", cresize);
  const palette = ["#7C2020", "#234E52", "#CDB088", "#A9CAD8", "#C88E8E", "#b6924e"];

  function burst(px, py, n) {
    if (reduce) return;
    const dpr = devicePixelRatio;
    for (let i = 0; i < n; i++) {
      confetti.push({
        x: px * dpr, y: py * dpr,
        vx: (Math.random() - 0.5) * 9 * dpr,
        vy: (Math.random() * -9 - 3) * dpr,
        g: 0.28 * dpr,
        s: (6 + Math.random() * 8) * dpr,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        c: palette[(Math.random() * palette.length) | 0],
        life: 1,
      });
    }
    if (!rafC) rafC = requestAnimationFrame(runConfetti);
  }
  function runConfetti() {
    ctx.clearRect(0, 0, CW, CH);
    confetti.forEach((p) => {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.008;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, p.life);
      // a tiny book: spine + cover
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s * 0.7, p.s, p.s * 1.4);
      ctx.fillStyle = "rgba(255,255,255,.7)";
      ctx.fillRect(p.s / 2 - p.s * 0.18, -p.s * 0.7, p.s * 0.18, p.s * 1.4);
      ctx.restore();
    });
    confetti = confetti.filter((p) => p.life > 0 && p.y < CH + 40);
    if (confetti.length) rafC = requestAnimationFrame(runConfetti);
    else { ctx.clearRect(0, 0, CW, CH); rafC = null; }
  }

  /* ---------- keyboard: Enter opens the book from cover ---------- */
  addEventListener("keydown", (e) => {
    if (e.key === "Enter" && document.body.classList.contains("is-closed")) openBook();
  });
})();
