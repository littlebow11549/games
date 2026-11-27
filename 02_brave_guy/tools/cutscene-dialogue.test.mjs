import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('prologue, stage/transform dialogue and normal cinematic captions share the same paper frame',async()=>{
 const [play,opening,cinema,style]=await Promise.all(['play.html','js/opening.js','js/cinematics.js','css/dialogue-paper.css'].map(p=>read(p).catch(()=>'')));
 assert.match(play,/class="dlg-box dialogue-paper"/);
 assert.match(opening,/<article class="dialogue-paper"/);
 assert.match(cinema,/class="cinema-caption dialogue-paper"/);
 assert.match(style,/#cinema\[data-dialogue-tone=normal\] \.dialogue-paper/);
 assert.match(style,/--paper-surface:\s*linear-gradient/);
});
test('impact captions keep the approved burst; ending credits never show an empty frame',async()=>{
 const [legacy,impact]=await Promise.all(['css/cinematics.css','css/impact-dialogue.css'].map(read));
 assert.doesNotMatch(legacy,/background:#021410c9|Hand-drawn speech plates/);
 assert.match(legacy,/data-act=credits[^\n]*\.cinema-caption[^\n]*display:none/);
 assert.match(impact,/data-dialogue-tone=impact[^\n]*\.cinema-caption p::before/);
});
