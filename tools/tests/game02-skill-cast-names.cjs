const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const art = require('../../02_brave_guy/assets/records/brave_guy_character-art.json');
const base = process.env.GAME_TEST_URL || 'http://127.0.0.1:8000/02_brave_guy/play.html';

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM || '/usr/bin/chromium',
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    page.setDefaultTimeout(90000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400 && /對話招式|%E5%B0%8D/.test(response.url())) errors.push(response.url());
    });
    await page.addInitScript(() => {
      localStorage.setItem('braveguy.save.v1', JSON.stringify({ seenOpening: true, rounds: 4 }));
    });
    const names = art.title_grid.rowsByAction;
    const notice = page.locator('#skill-announcements .skill-cast-name');
    const title = notice.locator('.character-title-art');
    for (const [column, lang] of art.title_grid.columnsByLanguage.entries()) {
      // The Japanese pass also proves that disabling the icon atlas cannot disable cast art.
      await page.goto(base + '?lang=' + lang + (lang === 'ja' ? '&skillStyle=legacy' : ''));
      await page.waitForFunction(() => window.__game?.game.phase === 'ready');
      for (const [id, character] of Object.entries(art.characters)) {
        await page.evaluate(async ({ id, names }) => {
          const g = __game;
          await g.prepareGameplay(id);
          g.save.rounds = 4;
          g.startStage(0, id);
          while (g.dialog) g.advanceDialog(true);
          g.game.paused = true; // Step the real input loop deterministically.
          g.game.queue = [];
          g.game.waveTimer = 999;
          g.game.ambushT = 999;
          g.hero.form = 'brave';
          g.hero.courage = 100;
          g.hero.invuln = 999;
          for (const name of names) g.game.abilities.add(name);
          const world = document.getElementById('world-ui');
          for (let i = 0; i < 72; i++) world.append(document.createElement('i'));
          const line = document.createElement('div');
          line.className = 'taunt hero';
          line.textContent = 'Uninterrupted dialogue';
          world.append(line);
          g.hero.sayEl = line;
          g.hero.sayT = 100;
        }, { id, names });
        if (lang === 'ja') assert.equal(await page.locator('#hud').getAttribute('data-art-style'), null);
        for (const [row, name] of names.entries()) {
          await page.evaluate(() => {
            const g = __game;
            g.hero.state = 'free';
            g.hero.qi = 100;
            g.game.hitstop = 0;
          });
          await page.keyboard.press(['q', 'e', 'r', 'f'][row]);
          await page.evaluate(() => __game.step(1, .02));
          assert.equal(await notice.count(), 1, id + ' ' + name);
          assert.equal(await title.getAttribute('data-character'), id);
          assert.equal(await title.getAttribute('data-action'), name);
          assert.equal(await title.getAttribute('data-locale'), lang);
          assert.equal(await title.getAttribute('aria-label'), character.titles.labels[row][column]);
          assert.equal(await notice.textContent(), '', 'no duplicate text with art');
          assert.equal(await page.locator('.taunt.hero').textContent(), 'Uninterrupted dialogue');
          const artState = await title.evaluate(async el => {
            const image = new Image();
            const css = getComputedStyle(el);
            image.src = css.backgroundImage.slice(5, -2);
            await image.decode();
            const box = el.getBoundingClientRect();
            const layer = document.querySelector('#skill-announcements');
            return {
              src: decodeURI(new URL(image.src).pathname),
              fits: box.width > 0 && box.height > 0 && box.left >= 0 && box.top >= 0 && box.right <= innerWidth && box.bottom <= innerHeight,
              visible: css.visibility === 'visible',
              clip: css.clipPath,
              layered: ['world-ui', 'angel-bubble'].every(id => Number(getComputedStyle(layer).zIndex) > Number(getComputedStyle(document.getElementById(id)).zIndex))
            };
          });
          assert(artState.src.endsWith('/' + character.titles.runtime), artState.src);
          assert(artState.fits && artState.visible && artState.layered, JSON.stringify(artState));
          if (id === 'nightmare') assert.match(artState.clip, /^polygon\(/);
          else assert.equal(artState.clip, 'none');
          await notice.evaluate(el => { el.dataset.previous = 'yes'; });
          await page.evaluate(() => { __game.hero.state = 'free'; __game.game.hitstop = 0; });
          await page.keyboard.press(['q', 'e', 'r', 'f'][row]);
          await page.evaluate(() => __game.step(1, .02));
          assert.equal(await notice.getAttribute('data-previous'), 'yes', 'blocked input cannot replace the name');
        }
        await page.evaluate(() => __game.showMenu());
        assert.equal(await notice.count(), 0, 'leaving combat removes cast art');
      }
    }
    assert.deepEqual(errors, []);
    console.log('PASS 3 characters × 4 active casts × 3 locales via Q/E/R/F; art decode, layering, dialogue, crowded HUD, blocked casts, and menu cleanup.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
