// Real Chromium navigation against the compiled Vite preview.
// Browser errors from unavailable backend services are not treated as server failures.
const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

test('built frontend renders root content at public routes', { timeout: 60000 }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const base = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
    for (const route of ["/","/privacidade","/termos"]) {
      await page.goto(new URL(route, base).toString(), { waitUntil: 'domcontentloaded' });
      await assert.doesNotReject(() => page.locator('#root').waitFor({ state: 'attached', timeout: 15000 }));
      await page.waitForTimeout(600);
      const content = (await page.locator('#root').innerText()).trim();
      assert.ok(content.length > 15, `Route ${route} did not render meaningful text`);
    }
  } finally {
    await browser.close();
  }
});
