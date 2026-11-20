const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM || '/usr/bin/chromium',
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 720 }]) {
      const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      await page.addInitScript(() => {
        localStorage.setItem('braveguy.save.v1', JSON.stringify({ seenOpening: true, rounds: 4 }));
      });
      await page.goto(process.env.BRAVE_URL || 'http://localhost:8000/02_brave_guy/play.html');
      await page.waitForFunction(() => window.__game?.game.phase === 'ready');
      for (const id of ['brave', 'angel', 'nightmare']) {
        const before = await page.evaluate(async id => {
          const g = window.__game;
          const { Box3, Vector3 } = await import(new URL('vendor/three/three.module.min.js', location.href).href);
          await g.prepareGameplay(id);
          g.startStage(3, id);
          g.hero.visual.root.position.set(17, 0, -19);
          g.hero.visual.root.rotation.y = 2;
          g.camera.position.set(-18, 14, 7);
          g.camera.lookAt(12, 8, -22);
          g.camera.updateMatrixWorld();
          g.startStage(3, id);
          const model = g.hero.visual.root, box = new Box3().setFromObject(model);
          const projected = box.getCenter(new Vector3()).project(g.camera).toArray();
          return {
            phase: g.game.phase,
            position: model.position.toArray(),
            yaw: model.rotation.y,
            world: g.hero.pos.toArray(),
            support: g.support.visual.root.position.toArray(),
            blocked: g.maze.blocked(g.hero.pos, g.HERO.radius),
            projected,
            matrix: g.camera.matrixWorld.toArray(),
          };
        }, id);
        assert.equal(before.phase, 'dialog');
        assert.deepEqual(before.position, [0, 0, 0]);
        assert.deepEqual(before.world, before.position);
        assert.equal(before.yaw, 0);
        assert.equal(before.support[0], -1.3);
        assert.equal(before.support[2], -.6);
        assert.equal(before.blocked, false);
        assert(Math.abs(before.projected[0]) <= .02);
        assert(Math.abs(before.projected[1]) <= .02);
        if (process.env.BRAVE_SHOT_DIR) await page.screenshot({ path: path.join(process.env.BRAVE_SHOT_DIR, `entry-${viewport.width}-${id}.png`) });
        await page.evaluate(() => {
          window.__game.game.waveTimer = 999;
          window.__game.game.queue = [];
        });
        await page.locator('#dlg-skip').click();
        const after = await page.evaluate(async () => {
          await new Promise(requestAnimationFrame);
          return { phase: __game.game.phase, position: __game.hero.visual.root.position.toArray(), matrix: __game.camera.matrixWorld.toArray() };
        });
        assert.equal(after.phase, 'playing');
        assert.deepEqual(after.position, before.position);
        assert.deepEqual(after.matrix, before.matrix);
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('PASS actual browser stage entry and dialogue skip for all three characters on mobile and desktop');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
