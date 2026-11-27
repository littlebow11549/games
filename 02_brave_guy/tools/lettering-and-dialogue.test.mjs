import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const css=path=>readFile(new URL('../css/'+path,import.meta.url),'utf8');
test('impact shouts, captions and live skill lettering share the ultimate-style downward ink',async()=>{
 const [system,impact,battle]=await Promise.all(['system-art.css','impact-dialogue.css','battle-presentation.css'].map(css));
 assert.match(system,/--comic-ink-extrusion:[^;]*3px 7px #111/);
 assert.match(impact,/text-shadow:var\(--comic-ink-extrusion\)/);
 assert.match(battle,/text-shadow:var\(--comic-ink-extrusion\)/);
});
test('dialogue nameplates have no leading diamond; speech tails are retained',async()=>{
 const [player,world]=await Promise.all(['character-art.css','panel-art.css'].map(css));
 assert.doesNotMatch(world,/\.support-label::before/);
 assert.doesNotMatch(player,/#dlg-name::before/);
 assert.match(world,/#angel-bubble::after/);
 assert.match(player,/\.character-speech:not\(\.has-word-art\)::before\s*\{\s*display:none !important;/);
});
