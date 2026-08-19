const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer-core');

const siteUrl = process.env.SITE_URL || 'http://127.0.0.1:8000';
const artifactDir = path.resolve('artifacts');

function findChromeExecutable() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];

  return candidates.find((candidate) => candidate && fs.existsSync(candidate));
}

async function openPage(browser, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(siteUrl, { waitUntil: 'networkidle2', timeout: 45_000 });
  return page;
}

async function run() {
  const chromePath = findChromeExecutable();
  assert.ok(chromePath, 'Chrome/Chromium não encontrado para o teste exploratório.');
  fs.mkdirSync(artifactDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const desktop = await openPage(browser, { width: 1440, height: 1000 });
    assert.match(await desktop.title(), /Greicin Ateliê/i, 'Título da página não identificado.');

    const navigation = await desktop.$$eval('nav a[href^="#"]', (links) => links.map((link) => link.getAttribute('href')));
    assert.ok(navigation.length >= 5, 'A navegação principal possui poucos links.');
    for (const href of navigation) {
      assert.notEqual(await desktop.$(href), null, `Seção ausente para o link ${href}.`);
    }

    const imageFailures = await desktop.$$eval('img', (images) => images
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.getAttribute('src')));
    assert.deepEqual(imageFailures, [], `Imagens indisponíveis: ${imageFailures.join(', ')}`);

    const formFields = await desktop.$$eval('#quote-form input, #quote-form textarea', (fields) => fields.length);
    assert.ok(formFields >= 6, 'Formulário de orçamento incompleto.');

    const whatsappHref = await desktop.$eval('.footer-whatsapp', (link) => link.getAttribute('href'));
    assert.equal(whatsappHref, 'https://wa.me/5511954498352', 'Contato do WhatsApp no rodapé está incorreto.');
    await desktop.screenshot({ path: path.join(artifactDir, 'desktop.png'), fullPage: true });
    await desktop.close();

    const mobile = await openPage(browser, { width: 375, height: 812, isMobile: true });
    await mobile.click('.menu');
    const menuIsOpen = await mobile.$eval('.header nav', (menu) => menu.classList.contains('open'));
    assert.equal(menuIsOpen, true, 'Menu mobile não abre.');
    await mobile.screenshot({ path: path.join(artifactDir, 'mobile-menu.png'), fullPage: true });
    await mobile.close();

    console.log('Exploratory browser test passed.');
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
