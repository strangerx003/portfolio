/* ============================================================
   RAMS Portfolio — interactivity
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle (persisted) ---------- */
  const root = document.documentElement;
  const themeToggle = $("#themeToggle");
  const storedTheme = localStorage.getItem("rams-theme");
  const initialTheme =
    storedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  setTheme(initialTheme);

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("rams-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0a1120" : "#0b1220");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  /* ---------- Scroll progress + navbar state ---------- */
  const progress = $("#scrollProgress");
  const navbar = $("#navbar");

  function onScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    if (progress) progress.style.width = pct + "%";
    if (navbar) navbar.classList.toggle("scrolled", doc.scrollTop > 12);
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const hamburger = $("#hamburger");
  const navLinks = $("#navLinks");

  function closeMenu() {
    if (!hamburger || !navLinks) return;
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", String(open));
    });
    $$("#navLinks a").forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) closeMenu();
    });
  }

  /* ---------- Active section highlighting ---------- */
  const sections = $$("main section[id]");
  const linkMap = new Map($$(".nav-links a").map((a) => [a.getAttribute("href"), a]));

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          linkMap.forEach((link) => link.classList.remove("active"));
          const active = linkMap.get("#" + entry.target.id);
          if (active) active.classList.add("active");
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("visible"));
  } else {
    const revealer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealer.observe(el));
  }

  /* ---------- Typewriter role ---------- */
  const tw = $("#typewriter");
  const roles = [
    "System Assurance Engineer",
    "RAMS Engineer — Railway Sector",
    "Reliability & Safety Specialist",
    "EN 50126 Practitioner"
  ];

  if (tw) {
    if (prefersReduced) {
      tw.textContent = roles[0];
    } else {
      let roleIdx = 0, charIdx = 0, deleting = false;
      (function tick() {
        const word = roles[roleIdx];
        charIdx += deleting ? -1 : 1;
        tw.textContent = word.slice(0, charIdx);
        let delay = deleting ? 45 : 95;
        if (!deleting && charIdx === word.length) { delay = 1900; deleting = true; }
        else if (deleting && charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; delay = 350; }
        setTimeout(tick, delay);
      })();
    }
  }
  /* ---------- Toast helper ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const target = parseFloat(el.dataset.count || "0");
    const suffix = el.dataset.suffix || "";
    if (prefersReduced) { el.textContent = target + suffix; return; }
    const dur = 1400;
    const start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  /* ---------- Gauge rings ---------- */
  function animateGauge(ring) {
    if (ring.dataset.done) return;
    ring.dataset.done = "1";
    const target = parseFloat(getComputedStyle(ring).getPropertyValue("--target")) || 0;
    if (prefersReduced) { ring.style.setProperty("--val", target); return; }
    const dur = 1500;
    const start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      ring.style.setProperty("--val", (target * eased).toFixed(2));
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  /* ---------- Skill bars ---------- */
  function fillSkill(skill) {
    if (skill.dataset.done) return;
    skill.dataset.done = "1";
    const fill = skill.querySelector(".skill-fill");
    if (fill) fill.style.width = (skill.dataset.level || "0") + "%";
  }

  /* ---------- Experience count (result shown, calc stays client-side) ---------- */
  const tenureStart = new Date(2024, 9, 3);
  function getTenure() {
    const now = new Date();
    let y = now.getFullYear() - tenureStart.getFullYear();
    let m = now.getMonth() - tenureStart.getMonth();
    if (now.getDate() < tenureStart.getDate()) m -= 1;
    if (m < 0) { y -= 1; m += 12; }
    return { y: Math.max(y, 0), m: Math.max(m, 0) };
  }
  const tenure = getTenure();
  const tenureEl = $("#expTenure");
  if (tenureEl) {
    tenureEl.textContent =
      tenure.y + " yr" + (tenure.y === 1 ? "" : "s") + " " +
      tenure.m + " mo" + (tenure.m === 1 ? "" : "s");
  }
  const expYearsEl = $("#expYears");
  if (expYearsEl) expYearsEl.dataset.count = String(tenure.y);

  /* Trigger visual animations when visible */
  const animatables = [...$$(".gauge-ring"), ...$$("[data-count]"), ...$$(".skill")];
  if ("IntersectionObserver" in window && !prefersReduced) {
    const animObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.classList.contains("gauge-ring")) animateGauge(el);
          else if (el.classList.contains("skill")) fillSkill(el);
          else animateCount(el);
          obs.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    animatables.forEach((el) => animObs.observe(el));
  } else {
    $$(".gauge-ring").forEach(animateGauge);
    $$("[data-count]").forEach(animateCount);
    $$(".skill").forEach(fillSkill);
  }

  /* ---------- Experience accordion ---------- */
  $$(".tl-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const body = document.getElementById(btn.getAttribute("aria-controls"));
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      if (body) body.classList.toggle("open", !open);
    });
  });

  /* ---------- Project filtering ---------- */
  const filterBtns = $$(".filter-btn");
  const projectCards = $$(".project-card");
  const emptyMsg = $("#filterEmpty");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      let visible = 0;
      projectCards.forEach((card) => {
        const match = f === "all" || card.dataset.cat === f;
        card.classList.toggle("hide", !match);
        if (match) visible++;
      });
      if (emptyMsg) emptyMsg.hidden = visible !== 0;
    });
  });

  /* ---------- Copy email ---------- */
  const copyBtn = $("#copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = "sivasaimutyala2003@gmail.com";
      try {
        await navigator.clipboard.writeText(email);
        showToast("Email copied to clipboard ✓");
      } catch (err) {
        const ta = document.createElement("textarea");
        ta.value = email;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showToast("Email copied to clipboard ✓");
      }
    });
  }

  /* ---------- Contact form (mailto) ---------- */
  const form = $("#contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fields = $$("input, textarea", form);
      let ok = true;
      fields.forEach((f) => {
        const valid = f.checkValidity() && f.value.trim() !== "";
        f.classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) { showToast("Please fill in all fields correctly."); return; }

      const data = new FormData(form);
      const subject = encodeURIComponent(data.get("subject"));
      const body = encodeURIComponent(
        "Hi Siva Sai Chary,\n\n" + data.get("message") +
        "\n\n—\n" + data.get("name") + "\n" + data.get("email")
      );
      showToast("Opening your email app…");
      window.location.href = "mailto:sivasaimutyala2003@gmail.com?subject=" + subject + "&body=" + body;
    });
    $$("input, textarea", form).forEach((f) =>
      f.addEventListener("input", () => f.classList.remove("invalid"))
    );
  }

  /* ---------- Back to top ---------- */
  const backTop = $("#backTop");
  if (backTop) {
    document.addEventListener(
      "scroll",
      () => backTop.classList.toggle("show", document.documentElement.scrollTop > 500),
      { passive: true }
    );
  }

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
