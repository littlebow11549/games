// DOM fixture: actual browser modules and language switches, no browser process required.
const assert = require('node:assert/strict');
const manifest = require('../../02_brave_guy/assets/records/brave_guy_character-art.json');

(async () => {
  global.location = { search: '' };
  global.document = {
    documentElement: {lang: ''}, querySelectorAll: () => [], baseURI: 'https://example.test/02_brave_guy/play.html',
    createElement: () => ({ dataset: {}, style: {}, setAttribute(k, v) { this[k] = v; } })
  };
  const { setLang } = await import('../../02_brave_guy/js/i18n.js?v=20261120assets');
  const { characterSkillTitle, characterTitle, applyCharacterSpeech } = await import('../../02_brave_guy/js/character-art.js?v=20261120nighttitles');
  const { CHARACTER_ART } = await import('../../02_brave_guy/js/character-art-data.js?v=20261120nighttitles');
  assert.deepEqual(CHARACTER_ART, manifest);
  const masks = new Set();
  for (const [column, locale] of manifest.title_grid.columnsByLanguage.entries()) {
    setLang(locale);
    for (const [id, c] of Object.entries(manifest.characters)) {
      for (const [row, action] of manifest.title_grid.rowsByAction.entries()) {
        const art = characterSkillTitle(id, action);
        assert.equal(art.dataset.locale, locale);
        assert.equal(art['aria-label'], c.titles.labels[row][column]);
        assert.equal(art.style.backgroundImage, 'url("' + c.titles.runtime + '")');
        if (id === 'nightmare') {
          assert.match(art.style.clipPath, /^polygon\((?:[\d.]+% [\d.]+%,){20,}[\d.]+% [\d.]+%\)$/);
          assert.equal(art.style.webkitClipPath, art.style.clipPath);
          assert.equal(characterTitle(c.titles.labels[row][column], id).style.clipPath, art.style.clipPath);
          masks.add(art.style.clipPath);
        } else {
          assert.equal(art.style.clipPath, undefined);
        }
      }
      const speech = { classList: {add() {}}, style: {setProperty(k, v) {this[k] = v;}}, dataset: {} };
      for (const kind of manifest.title_grid.speechColumns) {
        applyCharacterSpeech(speech, id, kind);
        assert.equal(speech.style.clipPath, undefined);
        assert(speech.style['--speech-atlas'].includes('/assets/runtime/'));
      }
    }
  }
  assert.equal(masks.size, 12, 'each of Nightmare’s four moves has a unique mask in every locale');
  console.log('PASS: 36 cast renderings / 12 distinct Nightmare masks, other characters and speech unaffected.');
})().catch(e => { console.error(e); process.exitCode = 1; });
