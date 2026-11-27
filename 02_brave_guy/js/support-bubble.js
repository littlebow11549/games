// Render only the in-world assistant, not player, enemy, or cutscene bubbles.
export function showSupportBubble(el,name,line,theme){
 el.dataset.support=theme;
 el.querySelector('.support-label').textContent=name;
 el.querySelector('.support-line').textContent=line;
 el.hidden=false;
}
