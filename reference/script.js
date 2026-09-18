/* Zuki's Caffetteria — small, dependency-free interactions */
(function () {
  "use strict";

  /* ---------- current year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  if (toggle && mobileMenu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      mobileMenu.hidden = open;
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        mobileMenu.hidden = true;
      });
    });
  }

  /* ---------- menu tabs ---------- */
  var tabs = document.querySelectorAll(".menu__tab");
  var panels = document.querySelectorAll(".menu__panel");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.getAttribute("data-tab");
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === target);
      });
    });
  });

  /* ---------- opening hours: highlight today + open/closed status ---------- */
  var hours = {
    0: [10, 16], // Sun
    1: [8, 17],  // Mon
    2: [8, 17],
    3: [8, 17],
    4: [8, 17],
    5: [8, 17],
    6: [9, 17]   // Sat
  };

  // Always use UK time (Europe/London), not the visitor's device timezone.
  function londonNow() {
    try {
      var p = {};
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London", weekday: "short",
        hour: "2-digit", minute: "2-digit", hour12: false
      }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: days[p.weekday], hour: (parseInt(p.hour, 10) % 24) + parseInt(p.minute, 10) / 60 };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), hour: d.getHours() + d.getMinutes() / 60 };
    }
  }
  var lon = londonNow();
  var today = lon.day;
  var hour = lon.hour;

  var todayRow = document.querySelector('.hours tr[data-day="' + today + '"]');
  if (todayRow) todayRow.classList.add("is-today");

  var statusEl = document.getElementById("heroStatus");
  if (statusEl) {
    var range = hours[today];
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var msg;
    if (range && hour >= range[0] && hour < range[1]) {
      var closes = String(range[1]).padStart(2, "0") + ":00";
      msg = '<span class="open">Open now</span> <span class="dot">·</span> until ' + closes + " today";
    } else {
      // find the next opening
      var nextMsg = "";
      for (var i = 0; i <= 7; i++) {
        var d = (today + i) % 7;
        var r = hours[d];
        if (!r) continue;
        if (i === 0 && hour < r[0]) {
          nextMsg = "opens " + String(r[0]).padStart(2, "0") + ":00 today";
          break;
        }
        if (i > 0) {
          var when = i === 1 ? "tomorrow" : dayNames[d];
          nextMsg = "opens " + String(r[0]).padStart(2, "0") + ":00 " + when;
          break;
        }
      }
      msg = '<span class="closed">Closed now</span> <span class="dot">·</span> ' + nextMsg;
    }
    statusEl.innerHTML = msg;
  }

  /* ---------- graceful image fallbacks ---------- */
  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    img.addEventListener("error", function () {
      if (img.classList.contains("nav__logo") ||
          img.classList.contains("hero__logo") ||
          img.classList.contains("footer__logo")) {
        img.classList.add("is-missing");
        return;
      }
      var fig = img.closest(".gallery__item");
      if (fig) fig.classList.add("no-img");
    });
    // handle images already failed before listener attached
    if (img.complete && img.naturalWidth === 0) {
      img.dispatchEvent(new Event("error"));
    }
  });

  /* ---------- cookie consent + map gating ---------- */
  var CONSENT_KEY = "zukis-consent";
  var mapEmbed = document.getElementById("mapEmbed");

  function loadMap() {
    if (!mapEmbed || mapEmbed.classList.contains("is-loaded")) return;
    var src = mapEmbed.getAttribute("data-src");
    if (!src) return;
    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = "Map to Zuki's Caffetteria, 3B Queen Street, Exeter";
    iframe.loading = "lazy";
    iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    mapEmbed.appendChild(iframe);
    mapEmbed.classList.add("is-loaded");
  }

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
  }

  var consent = getConsent();
  if (consent === "all") loadMap();

  var cookie = document.getElementById("cookie");
  if (cookie && !consent) {
    cookie.hidden = false;
    // small delay so the slide-in transition runs (setTimeout fires even in background tabs)
    setTimeout(function () { cookie.classList.add("is-visible"); }, 60);
    cookie.querySelectorAll("[data-cookie]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var choice = btn.getAttribute("data-cookie");
        setConsent(choice);
        if (choice === "all") loadMap();
        cookie.classList.remove("is-visible");
        setTimeout(function () { cookie.hidden = true; }, 450);
      });
    });
  }

  // manual "Show map" button — explicit per-action consent, works either way
  var mapBtn = document.getElementById("mapLoadBtn");
  if (mapBtn) mapBtn.addEventListener("click", loadMap);

  /* ---------- scroll reveal ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }
})();
