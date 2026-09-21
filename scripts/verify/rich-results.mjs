// Runs Google's Rich Results test for a URL in a browser and reports what the page says.
import { chromium } from "playwright";
const target = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(
    "https://search.google.com/test/rich-results?url=" + encodeURIComponent(target),
    { waitUntil: "load", timeout: 90000 },
  );
  let text = "";
  for (let i = 0; i < 24; i++) {
    await page.waitForTimeout(5000);
    text = await page.evaluate(() => document.body.innerText);
    if (
      /detected|not eligible|errors?|No items|Page is/i.test(text) &&
      !/Testing|Loading/i.test(text.slice(0, 400))
    )
      break;
  }
  await page.screenshot({ path: "results/rich-results.png", fullPage: true });
  console.log(text.replace(/\n{2,}/g, "\n").slice(0, 2500));
  await browser.close();
})();
