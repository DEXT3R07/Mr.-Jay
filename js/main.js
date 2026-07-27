(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     NAV — scroll state + mobile menu
  --------------------------------------------------------------------- */
  const nav = document.getElementById("nav");
  const onScrollNav = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  const burger = document.getElementById("navBurger");
  const navMobile = document.getElementById("navMobile");
  burger.addEventListener("click", () => {
    const open = navMobile.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  });
  navMobile.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    navMobile.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }));

  /* ---------------------------------------------------------------------
     Hero load-in sequence
  --------------------------------------------------------------------- */
  const hero = document.querySelector(".hero");
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("is-loaded")));

  /* ---------------------------------------------------------------------
     Reveal-on-scroll (IntersectionObserver)
  --------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const siblings = [...el.parentElement.querySelectorAll("[data-reveal]")];
          const idx = siblings.indexOf(el);
          setTimeout(() => el.classList.add("in-view"), idx * 90);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("in-view"));
  }

  /* ---------------------------------------------------------------------
     Custom cursor
  --------------------------------------------------------------------- */
  const cursor = document.querySelector(".cursor");
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  if (!isTouch) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let cx = mx, cy = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.classList.remove("is-hidden");
    });
    document.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));

    const dot = cursor.querySelector(".cursor-dot");
    const ring = cursor.querySelector(".cursor-ring");

    const tick = () => {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(tick);
    };
    tick();

    document.querySelectorAll("[data-hover], .service-row, .frame").forEach(el => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  } else {
    cursor.style.display = "none";
  }

  /* ---------------------------------------------------------------------
     Magnetic buttons
  --------------------------------------------------------------------- */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach(el => {
      let rect;
      el.addEventListener("mouseenter", () => { rect = el.getBoundingClientRect(); });
      el.addEventListener("mousemove", (e) => {
        if (!rect) rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------------------
     Services accordion
  --------------------------------------------------------------------- */
  const serviceRows = document.querySelectorAll(".service-row");
  serviceRows.forEach(row => {
    row.addEventListener("click", () => {
      const isOpen = row.classList.contains("is-open");
      serviceRows.forEach(r => r.classList.remove("is-open"));
      if (!isOpen) row.classList.add("is-open");
    });
  });

  /* ---------------------------------------------------------------------
     Film reel — drag to scroll + progress bar
  --------------------------------------------------------------------- */
  const reel = document.getElementById("reel");
  const progressBar = document.getElementById("reelProgress");

  let isDown = false, startX = 0, scrollStart = 0;

  const updateProgress = () => {
    const max = reel.scrollWidth - reel.clientWidth;
    const pct = max > 0 ? (reel.scrollLeft / max) : 0;
    const barTravel = 84; // 100% - bar's own 16% width
    progressBar.style.left = `${pct * barTravel}%`;
  };
  reel.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  reel.addEventListener("pointerdown", (e) => {
    isDown = true;
    reel.classList.add("is-dragging");
    startX = e.clientX;
    scrollStart = reel.scrollLeft;
    reel.setPointerCapture(e.pointerId);
  });
  reel.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    reel.scrollLeft = scrollStart - dx;
  });
  const endDrag = (e) => {
    isDown = false;
    reel.classList.remove("is-dragging");
    try { reel.releasePointerCapture(e.pointerId); } catch (err) {}
  };
  reel.addEventListener("pointerup", endDrag);
  reel.addEventListener("pointerleave", () => { isDown = false; reel.classList.remove("is-dragging"); });

  /* ---------------------------------------------------------------------
     Hero parallax on scroll (subtle)
  --------------------------------------------------------------------- */
  const heroImg = document.querySelector(".hero-bg img");
  if (!reduceMotion && heroImg) {
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroImg.style.transform = `scale(1.08) translateY(${y * 0.12}px)`;
      }
    }, { passive: true });
  }
})();
