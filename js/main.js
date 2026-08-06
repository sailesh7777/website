/* Neuroflow — interactions, scroll effects, charts */

(function () {
  "use strict";

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const stored = localStorage.getItem("theme");
  if (stored === "dark") root.classList.add("dark");

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const dark = root.classList.toggle("dark");
      localStorage.setItem("theme", dark ? "dark" : "light");
      refreshCharts();
    });
  }

  /* ---------- Nav scroll glass + mobile ---------- */
  const nav = document.getElementById("main-nav");
  const menuBtn = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuIconOpen = document.getElementById("menu-icon-open");
  const menuIconClose = document.getElementById("menu-icon-close");

  function onScrollNav() {
    if (!nav) return;
    if (window.scrollY > 16) {
      nav.classList.add("glass");
      nav.classList.remove("border-transparent");
    } else {
      nav.classList.remove("glass");
      nav.classList.add("border", "border-transparent");
    }
  }
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("is-open");
      menuIconOpen?.classList.toggle("hidden", open);
      menuIconClose?.classList.toggle("hidden", !open);
    });
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        mobileMenu.classList.remove("is-open");
        menuIconOpen?.classList.remove("hidden");
        menuIconClose?.classList.add("hidden");
      });
    });
  }

  /* ---------- Smooth section nav (hash links) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", id);
      }
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal, .reveal-scale, .check-pop");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "-80px 0px", threshold: 0.05 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- Counters ---------- */
  function animateCounter(el) {
    const to = parseFloat(el.dataset.to || "0");
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = to * eased;
      el.textContent = prefix + val.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + to.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(frame);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "-60px 0px", threshold: 0.2 }
  );
  document.querySelectorAll("[data-counter]").forEach((el) => counterObserver.observe(el));

  /* ---------- Particles ---------- */
  const particlesHost = document.getElementById("particles");
  if (particlesHost) {
    for (let i = 0; i < 34; i++) {
      const span = document.createElement("span");
      span.className = "particle";
      const size = (i % 3) + 2;
      span.style.left = ((i * 37) % 100) + "%";
      span.style.top = ((i * 61) % 100) + "%";
      span.style.width = size + "px";
      span.style.height = size + "px";
      span.style.setProperty("--dur", 8 + (i % 7) * 2 + "s");
      span.style.setProperty("--delay", (i % 9) * 0.6 + "s");
      particlesHost.appendChild(span);
    }
  }

  /* ---------- Hero parallax ---------- */
  const hero = document.getElementById("top");
  const heroVisual = document.getElementById("hero-visual");
  if (hero && heroVisual) {
    window.addEventListener(
      "scroll",
      () => {
        const rect = hero.getBoundingClientRect();
        const h = hero.offsetHeight || 1;
        const progress = Math.min(1, Math.max(0, -rect.top / h));
        const y = progress * 120;
        const scale = 1 - progress * 0.06;
        heroVisual.style.transform = `translateY(${y}px) scale(${scale})`;
      },
      { passive: true }
    );
  }

  /* ---------- Interactive demo ---------- */
  const SCENARIOS = [
    {
      label: "Support triage",
      prompt: "A customer says their invoice is wrong. What do you do?",
      reply:
        "I pulled invoice #48213, found a duplicated line item, issued a €120 credit note, replied to the customer in their language, and logged the fix in your CRM. Total handling time: 4.2 seconds.",
    },
    {
      label: "Lead qualification",
      prompt: "Qualify the 214 leads that came in this week.",
      reply:
        "Enriched all 214 leads, scored them against your ICP, booked 19 meetings directly into your calendar and moved 61 to nurture. 134 were disqualified with reasons attached.",
    },
    {
      label: "Document AI",
      prompt: "Extract the key terms from these 40 supplier contracts.",
      reply:
        "Parsed 40 contracts, extracted renewal dates, penalties and payment terms into a structured table, and flagged 6 auto-renewals expiring within 30 days.",
    },
  ];

  let demoTimer = null;
  const demoMsgs = document.getElementById("demo-messages");
  const demoThinking = document.getElementById("demo-thinking");
  const demoEmpty = document.getElementById("demo-empty");
  const demoBtns = document.querySelectorAll("[data-scenario]");

  function runScenario(i) {
    const s = SCENARIOS[i];
    if (!s || !demoMsgs) return;
    clearTimeout(demoTimer);
    demoEmpty?.classList.add("hidden");
    demoMsgs.innerHTML = "";
    demoThinking?.classList.remove("hidden");

    demoBtns.forEach((btn, idx) => {
      btn.classList.toggle("btn-hero", idx === i);
      btn.classList.toggle("btn-glass", idx !== i);
    });

    const userRow = document.createElement("div");
    userRow.className = "flex gap-3 justify-end msg-enter";
    userRow.innerHTML = `
      <p class="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">${s.prompt}</p>
      <span class="grid size-8 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
        <i data-lucide="user" class="size-4"></i>
      </span>`;
    demoMsgs.appendChild(userRow);
    if (window.lucide) lucide.createIcons();

    demoTimer = setTimeout(() => {
      demoThinking?.classList.add("hidden");
      const aiRow = document.createElement("div");
      aiRow.className = "flex gap-3 msg-enter";
      aiRow.innerHTML = `
        <span class="bg-brand grid size-8 shrink-0 place-items-center rounded-xl text-primary-foreground">
          <i data-lucide="bot" class="size-4"></i>
        </span>
        <p class="max-w-[80%] rounded-2xl bg-muted px-4 py-2.5 text-sm leading-relaxed text-foreground">${s.reply}</p>`;
      demoMsgs.appendChild(aiRow);
      if (window.lucide) lucide.createIcons();
    }, 1200);
  }

  demoBtns.forEach((btn) => {
    btn.addEventListener("click", () => runScenario(parseInt(btn.dataset.scenario, 10)));
  });

  /* ---------- Pricing calculator ---------- */
  const workflowsEl = document.getElementById("range-workflows");
  const tasksEl = document.getElementById("range-tasks");
  const seatsEl = document.getElementById("range-seats");
  const workflowsVal = document.getElementById("val-workflows");
  const tasksVal = document.getElementById("val-tasks");
  const seatsVal = document.getElementById("val-seats");
  const estimateEl = document.getElementById("estimate");
  const savingsEl = document.getElementById("savings");
  const annualBtn = document.getElementById("billing-annual");
  const monthlyBtn = document.getElementById("billing-monthly");
  let annual = true;

  function updatePricing() {
    const workflows = parseInt(workflowsEl?.value || "4", 10);
    const tasks = parseInt(tasksEl?.value || "25", 10);
    const seats = parseInt(seatsEl?.value || "15", 10);
    if (workflowsVal) workflowsVal.textContent = String(workflows);
    if (tasksVal) tasksVal.textContent = tasks + "k";
    if (seatsVal) seatsVal.textContent = String(seats);
    const raw = 690 + workflows * 210 + tasks * 26 + seats * 18;
    const estimate = Math.round(annual ? raw * 0.82 : raw);
    const savings = Math.round(tasks * 1000 * 0.09 + workflows * 1400);
    if (estimateEl) {
      estimateEl.textContent = "€" + estimate.toLocaleString();
      estimateEl.classList.remove("estimate-pop");
      void estimateEl.offsetWidth;
      estimateEl.classList.add("estimate-pop");
    }
    if (savingsEl) savingsEl.textContent = "€" + savings.toLocaleString();
  }

  [workflowsEl, tasksEl, seatsEl].forEach((el) => {
    el?.addEventListener("input", updatePricing);
  });

  annualBtn?.addEventListener("click", () => {
    annual = true;
    annualBtn.classList.add("btn-hero");
    annualBtn.classList.remove("btn-glass");
    monthlyBtn?.classList.add("btn-glass");
    monthlyBtn?.classList.remove("btn-hero");
    updatePricing();
  });
  monthlyBtn?.addEventListener("click", () => {
    annual = false;
    monthlyBtn.classList.add("btn-hero");
    monthlyBtn.classList.remove("btn-glass");
    annualBtn?.classList.add("btn-glass");
    annualBtn?.classList.remove("btn-hero");
    updatePricing();
  });
  updatePricing();

  /* ---------- Contact form ---------- */
  const contactForm = document.getElementById("contact-form");
  const contactDone = document.getElementById("contact-done");
  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    contactForm.classList.add("hidden");
    contactDone?.classList.remove("hidden");
  });

  /* ---------- Charts (Chart.js) ---------- */
  let areaChart, pieChart, barChart;

  function resolveColor(cssVar) {
    const probe = document.createElement("span");
    probe.style.color = `var(${cssVar})`;
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    document.body.removeChild(probe);
    return resolved || "#7c5cbf";
  }

  function chartColors() {
    return {
      primary: resolveColor("--primary"),
      accent: resolveColor("--accent"),
      secondary: resolveColor("--secondary"),
      muted: resolveColor("--muted-foreground"),
      border: resolveColor("--border"),
      popover: resolveColor("--popover"),
      popoverFg: resolveColor("--popover-foreground"),
      mutedBg: resolveColor("--muted"),
    };
  }

  function initCharts() {
    if (typeof Chart === "undefined") return;
    const c = chartColors();
    const tooltip = {
      backgroundColor: c.popover,
      titleColor: c.popoverFg,
      bodyColor: c.popoverFg,
      borderColor: c.border,
      borderWidth: 1,
      cornerRadius: 12,
      padding: 10,
    };

    const areaCtx = document.getElementById("chart-area");
    if (areaCtx) {
      areaChart?.destroy();
      areaChart = new Chart(areaCtx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
          datasets: [
            {
              label: "Tasks",
              data: [1200, 2100, 3400, 4200, 6100, 8400, 11200],
              borderColor: c.primary,
              backgroundColor: (ctx) => {
                const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
                g.addColorStop(0, c.primary);
                g.addColorStop(1, "transparent");
                return g;
              },
              fill: true,
              tension: 0.35,
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: c.muted, font: { size: 12 } },
              border: { display: false },
            },
            y: {
              grid: { color: c.border, drawBorder: false },
              ticks: { color: c.muted, font: { size: 12 } },
              border: { display: false },
            },
          },
        },
      });
    }

    const pieCtx = document.getElementById("chart-pie");
    if (pieCtx) {
      pieChart?.destroy();
      pieChart = new Chart(pieCtx, {
        type: "doughnut",
        data: {
          labels: ["Support", "Sales", "Ops", "Finance"],
          datasets: [
            {
              data: [42, 28, 20, 10],
              backgroundColor: [c.primary, c.accent, c.secondary, c.muted],
              borderWidth: 0,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "55%",
          plugins: { legend: { display: false }, tooltip },
        },
      });
    }

    const barCtx = document.getElementById("chart-bar");
    if (barCtx) {
      barChart?.destroy();
      barChart = new Chart(barCtx, {
        type: "bar",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Hours",
              data: [42, 58, 51, 74, 66, 31, 24],
              backgroundColor: c.accent,
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: c.muted, font: { size: 12 } },
              border: { display: false },
            },
            y: {
              grid: { color: c.border, drawBorder: false },
              ticks: { color: c.muted, font: { size: 12 } },
              border: { display: false },
              display: false,
            },
          },
        },
      });
    }
  }

  function refreshCharts() {
    requestAnimationFrame(initCharts);
  }

  /* Init lucide + charts when ready */
  function boot() {
    if (window.lucide) lucide.createIcons();
    initCharts();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* Footer year */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
