// Focused CSS regression; browser appearance is verified separately in an isolated profile.
const fs=require('node:fs');const assert=require('node:assert/strict');
const css=fs.readFileSync('02_brave_guy/css/character-art.css','utf8');
const selector='.game-art #hud[data-art-style="classic2d"] .act.lock.on::before';
const rules=[...css.replace(/\/\*[\s\S]*?\*\//g,'').matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(m=>m[1].trim()===selector);
assert.equal(rules.length,1);const rule=rules[0][2];
assert.match(rule,/box-shadow\s*:\s*none/);assert.match(rule,/brightness\(1\.3\)\s+drop-shadow\(/);
assert.match(fs.readFileSync('02_brave_guy/play.html','utf8'),/id="btn-lock"[^>]+data-key="T"/);
console.log('PASS: classic2d active lock uses alpha-shaped glow, no box shadow; T key badge preserved.');
