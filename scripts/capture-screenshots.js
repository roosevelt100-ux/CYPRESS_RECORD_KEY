const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const SITE = process.env.SITE_URL || 'https://greicinatelie.netlify.app';
const OUT_DIR = 'screenshots';

const viewports = [
  { name: 'desktop', width: 1200, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

function findChromeExecutable(){
  const candidates = [];
  if(process.env.PUPPETEER_EXECUTABLE_PATH) candidates.push(process.env.PUPPETEER_EXECUTABLE_PATH);
  if(process.env.CHROME_PATH) candidates.push(process.env.CHROME_PATH);
  const pf = process.env['PROGRAMFILES'] || 'C:\\Program Files';
  const pfx86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
  candidates.push(path.join(pf, 'Google', 'Chrome', 'Application', 'chrome.exe'));
  candidates.push(path.join(pfx86, 'Google', 'Chrome', 'Application', 'chrome.exe'));
  for(const c of candidates){
    try{ if(c && fs.existsSync(c)) return c; }catch(e){}
  }
  return null;
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const chromePath = findChromeExecutable();
  if(!chromePath){
    console.error('Chrome executable not found. Set PUPPETEER_EXECUTABLE_PATH or CHROME_PATH to your Chrome/Edge binary.');
    process.exit(1);
  }

  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    console.log(`Loading ${SITE} at ${vp.name} (${vp.width}x${vp.height})`);
    await page.goto(SITE, { waitUntil: 'networkidle2', timeout: 45000 }).catch(err => {
      console.error('Failed to load page:', err.message);
    });
    // give a moment for fonts/images to render
    await sleep(800);
    const outPath = path.join(OUT_DIR, `${vp.name}.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`Saved ${outPath}`);
  }

  await browser.close();
  console.log('All screenshots captured.');
})();
