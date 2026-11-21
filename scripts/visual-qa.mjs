import { chromium } from "playwright";
import { mkdirSync } from "fs";

const OUT = "/opt/cursor/artifacts";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function shot(page, name) {
  const path = `${OUT}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log("saved", path);
}

const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktop.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await desktop.waitForTimeout(800);
await shot(desktop, "01-accueil-hero-desktop");

await desktop.locator("#presentation").scrollIntoViewIfNeeded();
await desktop.waitForTimeout(400);
await shot(desktop, "02-accueil-presentation");

await desktop.evaluate(() => window.scrollBy(0, 900));
await desktop.waitForTimeout(500);
await shot(desktop, "03-accueil-materiaux");

await desktop.goto("http://127.0.0.1:3000/a-propos", { waitUntil: "networkidle" });
await desktop.waitForTimeout(400);
await shot(desktop, "04-a-propos");

await desktop.goto("http://127.0.0.1:3000/materiaux", { waitUntil: "networkidle" });
await desktop.waitForTimeout(400);
await shot(desktop, "05-materiaux");

await desktop.goto("http://127.0.0.1:3000/realisations", { waitUntil: "networkidle" });
await desktop.waitForTimeout(400);
await shot(desktop, "06-realisations");

await desktop.goto("http://127.0.0.1:3000/contact", { waitUntil: "networkidle" });
await desktop.waitForTimeout(400);
await shot(desktop, "07-contact-desktop");

await desktop.getByRole("button", { name: /envoyer ma demande/i }).click();
await desktop.waitForTimeout(500);
await shot(desktop, "08-contact-validation");

await desktop.fill("#fullName", "Test Client");
await desktop.fill("#phone", "78000000");
await desktop.selectOption("#material", "sable");
await desktop.fill("#quantity", "2");
await desktop.fill("#deliveryLocation", "Ouagadougou");
await desktop.check("#consent");
await desktop.getByRole("button", { name: /envoyer ma demande/i }).click();
await desktop.waitForSelector("#form-status");
await desktop.waitForTimeout(600);
await shot(desktop, "09-contact-smtp-non-configure");

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
await mobile.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await mobile.waitForTimeout(800);
await shot(mobile, "10-accueil-hero-mobile");

const scrollWidth = await mobile.evaluate(() => document.documentElement.scrollWidth);
const clientWidth = await mobile.evaluate(() => document.documentElement.clientWidth);
console.log("mobile_scroll_check", { scrollWidth, clientWidth, overflow: scrollWidth > clientWidth + 1 });

await mobile.goto("http://127.0.0.1:3000/contact", { waitUntil: "networkidle" });
await mobile.waitForTimeout(400);
await shot(mobile, "11-contact-mobile");

// widths check
for (const w of [320, 375, 430, 768, 1024]) {
  await mobile.setViewportSize({ width: w, height: 800 });
  await mobile.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
  await mobile.waitForTimeout(300);
  const sw = await mobile.evaluate(() => document.documentElement.scrollWidth);
  const cw = await mobile.evaluate(() => document.documentElement.clientWidth);
  console.log(`width_${w}`, { sw, cw, ok: sw <= cw + 1 });
}

await browser.close();
console.log("done");
