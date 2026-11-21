import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";

const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const OUT = "/opt/cursor/artifacts/phase2";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = { overflows: [], phones: [], whatsapp: [], menu: [] };

async function shot(page, name) {
  const path = `${OUT}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log("saved", path);
}

async function checkOverflow(page, label) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  const overflow = scrollWidth > clientWidth + 1;
  results.overflows.push({ label, scrollWidth, clientWidth, overflow });
  console.log("overflow", label, { scrollWidth, clientWidth, overflow });
}

const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktop.goto(`${BASE}/`, { waitUntil: "networkidle" });
await desktop.waitForTimeout(600);
await shot(desktop, "p2-01-accueil-desktop");

await desktop.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
await desktop.waitForTimeout(400);
await shot(desktop, "p2-02-contact-desktop");

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

await mobile.goto(`${BASE}/`, { waitUntil: "networkidle" });
await mobile.waitForTimeout(700);
await shot(mobile, "p2-03-accueil-mobile-ferme");
await checkOverflow(mobile, "accueil-390");

await mobile.evaluate(() => window.scrollTo(0, 0));
await mobile.waitForTimeout(200);
const openBtn = mobile.getByRole("button", { name: /ouvrir le menu/i });
await openBtn.click({ force: true });
await mobile.waitForTimeout(500);
await shot(mobile, "p2-04-menu-mobile-ouvert");
results.menu.push({ open: true });

const links = mobile.locator('[aria-label="Navigation mobile"] a');
const linkCount = await links.count();
results.menu.push({ linkCount });
const closeBtn = mobile.locator('button[aria-label="Fermer le menu"]').last();
await closeBtn.waitFor({ state: "visible", timeout: 5000 });
await closeBtn.click({ force: true });
await mobile.waitForTimeout(400);
await shot(mobile, "p2-05-menu-mobile-ferme");

for (const path of ["/a-propos", "/materiaux", "/realisations", "/contact"]) {
  await mobile.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await mobile.waitForTimeout(350);
  await checkOverflow(mobile, `${path}-390`);
  await shot(mobile, `p2-page${path.replace("/", "-") || "-home"}-390`);
}

// tel / wa checks on contact
await mobile.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
const telHrefs = await mobile.locator('a[href^="tel:"]').evaluateAll((els) =>
  els.map((e) => e.getAttribute("href")),
);
const waHrefs = await mobile.locator('a[href*="wa.me"]').evaluateAll((els) =>
  els.map((e) => e.getAttribute("href")),
);
const mailHrefs = await mobile.locator('a[href^="mailto:"]').evaluateAll((els) =>
  els.map((e) => e.getAttribute("href")),
);
results.phones = telHrefs;
results.whatsapp = waHrefs;
results.mailto = mailHrefs;
console.log("tel", telHrefs);
console.log("wa", waHrefs);
console.log("mail", mailHrefs);

await shot(mobile, "p2-06-contact-mobile");

const widths = [320, 360, 375, 390, 414, 768, 1024, 1440];
for (const w of widths) {
  await mobile.setViewportSize({ width: w, height: Math.min(900, Math.round(w * 1.8)) });
  await mobile.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await mobile.waitForTimeout(250);
  await checkOverflow(mobile, `home-${w}`);
  if ([320, 375, 414, 768].includes(w)) {
    await shot(mobile, `p2-home-${w}`);
    await mobile.evaluate(() => window.scrollTo(0, 0));
    const btn = mobile.getByRole("button", { name: /ouvrir le menu/i });
    if ((await btn.count()) > 0 && w < 1024) {
      await btn.click({ force: true });
      await mobile.waitForTimeout(350);
      await shot(mobile, `p2-menu-${w}`);
      await mobile.keyboard.press("Escape").catch(() => {});
    }
  }
}

writeFileSync(`${OUT}/qa-results.json`, JSON.stringify(results, null, 2));
console.log("QA_DONE", JSON.stringify(results, null, 2));
await browser.close();
