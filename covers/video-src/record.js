const { chromium } = require('playwright');
const path = require('path');

const GAME_URL = 'file://' + path.resolve(__dirname, '../../index.html');
const OUT_DIR = path.resolve(__dirname, 'out');

async function press(page, code, ms) {
  await page.keyboard.down(code);
  await page.waitForTimeout(ms);
  await page.keyboard.up(code);
}

async function playSequence(page) {
  // Start the run
  await page.waitForTimeout(400);
  await page.click('#startBtn');
  await page.waitForTimeout(600);

  // A little scripted flight/combat loop, repeated to fill the clip
  for (let i = 0; i < 4; i++) {
    // turn + thrust
    page.keyboard.down('KeyW');
    await press(page, 'KeyA', 500);
    await page.waitForTimeout(300);
    await press(page, 'KeyD', 900);
    await page.waitForTimeout(200);
    page.keyboard.up('KeyW');

    // swing a few times
    for (let j = 0; j < 3; j++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(250);
    }

    // throw the orb out and let it return
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(1400);

    // repel
    await page.keyboard.press('KeyQ');
    await page.waitForTimeout(900);

    // more flying
    page.keyboard.down('KeyW');
    await press(page, 'KeyD', 700);
    await page.waitForTimeout(600);
    page.keyboard.up('KeyW');
  }

  await page.waitForTimeout(500);
}

async function record({ width, height, hasTouch, name }) {
  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext({
    viewport: { width, height },
    hasTouch: !!hasTouch,
    recordVideo: { dir: OUT_DIR, size: { width, height } },
  });
  const page = await context.newPage();
  await page.goto(GAME_URL);
  await playSequence(page);
  await context.close();
  await browser.close();

  // Playwright names the file with a hash; find and rename it
  const fs = require('fs');
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'));
  const newest = files
    .map(f => ({ f, t: fs.statSync(path.join(OUT_DIR, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)[0].f;
  fs.renameSync(path.join(OUT_DIR, newest), path.join(OUT_DIR, name + '.webm'));
  console.log('saved', name + '.webm');
}

(async () => {
  const fs = require('fs');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await record({ width: 1920, height: 1080, hasTouch: false, name: 'landscape' });
  await record({ width: 1080, height: 1920, hasTouch: true, name: 'portrait' });
})();
