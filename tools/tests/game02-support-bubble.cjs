const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {readFileSync}=require('node:fs');
const {pathToFileURL}=require('node:url');
const base=path.resolve(__dirname,'../../02_brave_guy');
test('support speaker name and line are separate, localized, safe live text that can change with roster',async()=>{
 const {showSupportBubble}=await import(pathToFileURL(path.join(base,'js/support-bubble.js')));
 const name={textContent:''},body={textContent:''};
 const el={hidden:true,dataset:{},querySelector(sel){return {'.support-label':name,'.support-line':body}[sel];}};
 showSupportBubble(el,'小天使','喔。','angel');
 assert.equal(name.textContent,'小天使');assert.equal(body.textContent,'喔。');
 assert.equal(el.dataset.support,'angel');assert.equal(el.hidden,false);
 showSupportBubble(el,'Brave Guy','<Good catch>','brave');
 assert.equal(name.textContent,'Brave Guy');assert.equal(body.textContent,'<Good catch>');
 assert.equal(el.dataset.support,'brave');
 const html=readFileSync(path.join(base,'play.html'),'utf8');
 assert.match(html,/<div id="angel-bubble"[^>]*hidden[^>]*><span class="support-label"><\/span><span class="support-line"><\/span><\/div>/);
});
