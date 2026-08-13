const puppeteer = require('puppeteer');
const fs = require('fs');

const SITE = process.env.SITE_URL || 'https://greicin-atelie-site.netlify.app';
const OUT_DIR = 'screenshots';

const viewports = [
  { name: 'desktop', width: 1200, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    console.log(`Loading ${SITE} at ${vp.name} (${vp.width}x${vp.height})`);
    await page.goto(SITE, { waitUntil: 'networkidle2', timeout: 45000 }).catch(err => {
      console.error('Failed to load page:', err.message);
    });
    // give a moment for fonts/images to render
    await page.waitForTimeout(800);
    const path = `${OUT_DIR}/${vp.name}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log(`Saved ${path}`);
  }

  await browser.close();
  console.log('All screenshots captured.');
})();
