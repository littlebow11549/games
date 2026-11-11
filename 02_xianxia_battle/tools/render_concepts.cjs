// 輸出佔位角色的三視圖 PNG 到 assets/source/pic/concept/。
// 先在 repo 根目錄啟動靜態伺服器，再執行：BASE_URL=http://localhost:8000/ node 02_xianxia_battle/tools/render_concepts.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const base = process.env.BASE_URL || 'http://localhost:8000/';
  const outDir = path.join(__dirname, '..', 'assets', 'source', 'pic', 'concept');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => { throw e; });
  await page.goto(base + '02_xianxia_battle/tools/concept.html');
  await page.waitForFunction(() => window.ready);
  const images = await page.evaluate(() => window.renderAll());
  for (const [name, url] of Object.entries(images)) fs.writeFileSync(path.join(outDir, name + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  console.log(`已輸出 ${Object.keys(images).length} 張 → ${outDir}`);
  await browser.close();
})();
