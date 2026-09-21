// Deployed-site checks: sections, badge, banner, third-party requests, console, hydration, key in assets, load time, request count, CLS, images.
import { chromium } from "playwright";
const BASE = process.argv[2];
const KEY = process.env.PLACES_KEY || "";
(async () => {
  const browser = await chromium.launch();
  const out = {};
  for (const w of [375, 768, 1280]) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: 900 },
      deviceScaleFactor: w === 375 ? 2 : 1,
    });
    const page = await ctx.newPage();
    const errors = [],
      hosts = new Set(),
      responses = [];
    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning")
        errors.push(m.text().slice(0, 140));
    });
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message.slice(0, 140)));
    page.on("response", async (r) => {
      const u = new URL(r.url());
      hosts.add(u.host);
      let len = Number(r.headers()["content-length"] || 0);
      if (!len) {
        try {
          len = (await r.body()).length;
        } catch {}
      }
      responses.push({
        path: u.pathname,
        ct: r.headers()["content-type"] || "",
        len,
        status: r.status(),
        cache: r.headers()["cf-cache-status"] || r.headers()["x-nextjs-cache"] || "",
      });
    });
    await page.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    const t0 = Date.now();
    const resp = await page.goto(BASE + "/", { waitUntil: "load" });
    const loadMs = Date.now() - t0;
    const nav = await page.evaluate(() => {
      const n = performance.getEntriesByType("navigation")[0];
      return {
        ttfb: Math.round(n.responseStart),
        domContentLoaded: Math.round(n.domContentLoadedEventEnd),
        load: Math.round(n.loadEventEnd),
        transfer: n.transferSize,
      };
    });
    const atLoad = {
      requests: responses.length,
      bytes: responses.reduce((s, r) => s + r.len, 0),
    };
    await page.waitForTimeout(500);
    const info = await page.evaluate(() => ({
      status: null,
      sections: [
        ".nav",
        ".hero",
        ".story",
        ".menu",
        ".gallery",
        ".order",
        ".visit",
        ".footer",
      ].filter((s) => !document.querySelector(s)),
      badge: document.querySelector(".rating-badge")?.getAttribute("aria-label") || null,
      banner: (() => {
        const b = document.querySelector(".cookie");
        return !!b && !b.hidden && b.getBoundingClientRect().height > 0;
      })(),
      scrollW: document.documentElement.scrollWidth,
      canonical: document.querySelector("link[rel=canonical]")?.href,
      title: document.title,
      iframes: document.querySelectorAll("iframe").length,
    }));
    // scroll for lazy images and CLS
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 150));
      }
    });
    // Every image must have finished, or the byte count is of a page still loading.
    await page
      .waitForFunction(() => [...document.images].every((i) => i.complete), null, {
        timeout: 30000,
      })
      .catch(() => {});
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.scrollTo(0, 0));
    const cls = await page.evaluate(() => window.__cls);
    const images = responses.filter((r) => r.ct.startsWith("image/"));
    const chosen = await page.evaluate(() => {
      const w = {};
      for (const i of document.images) {
        const m = /-(\d+)\.(jpg|png)/.exec(i.currentSrc);
        const k = m ? m[1] : "other";
        w[k] = (w[k] || 0) + 1;
      }
      return w;
    });
    const complete = await page.evaluate(
      () =>
        [...document.images].filter((i) => i.complete).length +
        "/" +
        document.images.length,
    );
    const byType = {};
    for (const r of images) byType[r.ct] = (byType[r.ct] || 0) + r.len;
    const cookies = (await ctx.cookies()).map((c) => c.name);
    // key in served assets
    let keyHits = 0,
      assetsChecked = 0;
    if (KEY) {
      const urls = await page.evaluate(() =>
        [...document.scripts]
          .map((s) => s.src)
          .concat([...document.styleSheets].map((s) => s.href))
          .filter(Boolean),
      );
      for (const u of urls) {
        const t = await (await ctx.request.get(u)).text();
        assetsChecked++;
        if (t.includes(KEY)) keyHits++;
      }
      const html = await (await ctx.request.get(BASE + "/")).text();
      assetsChecked++;
      if (html.includes(KEY)) keyHits++;
    }
    // Booking form, read-only: the area choice, the offered times against the kitchen, the copy.
    await page
      .locator(".booking__areas")
      .scrollIntoViewIfNeeded()
      .catch(() => {});
    await page.waitForTimeout(400);
    const form = await page.evaluate(() => {
      const r = (el) => {
        const b = el.getBoundingClientRect();
        return [Math.round(b.width), Math.round(b.height)];
      };
      const areas = document.querySelector(".booking__areas");
      return {
        areaLegend: areas?.querySelector("legend")?.textContent ?? null,
        areaOptions: [...document.querySelectorAll(".booking__area")].map((l) => ({
          label: l.textContent.trim(),
          size: r(l),
        })),
        weatherNote: document.getElementById("booking-area-note")?.textContent ?? null,
        timesOffered: [...document.querySelectorAll("#booking-time option")]
          .map((o) => o.value)
          .filter(Boolean),
        beforeSubmit: document.getElementById("booking-policy")?.textContent ?? null,
        submitLabel:
          document.querySelector("form.booking button[type=submit]")?.textContent ?? null,
        menuNote:
          document.querySelector(".menu__note")?.textContent?.split("Add a")[0].trim() ??
          null,
        kitchenRows: [...document.querySelectorAll(".hours tr")].map((tr) =>
          tr.textContent.replace(/\s+/g, " ").trim(),
        ),
      };
    });
    await page
      .locator(".booking__areas")
      .screenshot({ path: `results/form-area-${w}.png` })
      .catch(() => {});
    out[w] = {
      status: resp.status(),
      server: resp.headers()["server"],
      cfRay: !!resp.headers()["cf-ray"],
      loadMs,
      nav,
      atLoad,
      afterScroll: {
        requests: responses.length,
        bytes: responses.reduce((s, r) => s + r.len, 0),
      },
      hosts: [...hosts],
      thirdPartyBeforeConsent: [...hosts].filter((h) => !BASE.includes(h)),
      cookies,
      ...info,
      cls,
      images: {
        count: images.length,
        bytes: images.reduce((s, r) => s + r.len, 0),
        byType,
        widthsChosen: chosen,
        complete,
      },
      injectedScript: responses.some((r) => r.path.includes("/cdn-cgi/")),
      keyInAssets: KEY ? `${keyHits} of ${assetsChecked}` : "no key given",
      form,
      console: errors,
    };
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
