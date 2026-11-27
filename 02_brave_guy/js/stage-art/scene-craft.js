// Each scene uses an original marking, laid into its existing floor texture.
const look=(motif,base,ink,glint,frame)=>Object.freeze({motif,base,ink,glint,frame});
export const sceneCraft=Object.freeze({
 '1-0':look('quilt','#604051','#e2b591','#fff0ba','mat'),
 '1-1':look('sunflower','#ad7d55','#fce9a9','#fff1c2','paver'),
 '1-2':look('court','#3c5e54','#edf2bd','#ffd77c','court'),
 '1-3':look('ledger','#6b5264','#e6be9d','#f8ddb3','mat'),
 '1-4':look('school-crest','#514362','#dfb994','#ffe5c1','paver'),
 '2-1':look('fern','#385b58','#b7d9a9','#ecda96','garden'),
 '2-2':look('lantern','#5e4c56','#edb57d','#ffe7a0','paver'),
 '3-0':look('clock','#46384d','#dba888','#f7d6ac','mat'),
 '3-1':look('lift','#3e6570','#c2e2da','#fceab9','brass'),
 '3-2':look('coffee','#4e6960','#e4cba2','#fff2cb','paver'),
 '3-3':look('speech','#514563','#d1c1e6','#ead9fb','mat'),
 '3-4':look('signal','#445e73','#b6dcdf','#e7e8ff','brass'),
 '3-5':look('compass','#5b495c','#e1ae9d','#ffe1ae','paver'),
 '3-6':look('vault','#584354','#edc080','#ffe9ad','brass'),
 '3-7':look('briefing','#4b4161','#d9b596','#e8c9ba','mat'),
 '4-1':look('crystal','#40334e','#d296dc','#f9d6ff','rift')
});
const stamp={
 quilt:'M-.5 0L0-.5.5 0 0 .5ZM-.25 0L0-.25.25 0 0 .25ZM-.5-.5l.16.16M.5-.5l-.16.16M-.5.5l.16-.16M.5.5l-.16-.16',
 sunflower:'M0-.62V-.44M0 .44V.62M-.62 0H-.44M.44 0H.62M-.44-.44l.13.13M.44-.44l-.13.13M-.44.44l.13-.13M.44.44l-.13-.13M.32 0A.32.32 0 1 1-.32 0A.32.32 0 1 1 .32 0',
 court:'M.52 0A.52.52 0 1 1-.52 0A.52.52 0 1 1 .52 0M-.55 0H.55M0-.52C-.22-.2-.22.2 0 .52M0-.52C.22-.2.22.2 0 .52',
 ledger:'M-.58-.26Q-.28-.47 0-.25Q.28-.47.58-.26V.33Q.28.18 0 .4Q-.28.18-.58.33ZM0-.25V.4M-.42-.09L-.15-.12M.15-.12l.27.03',
 'school-crest':'M-.49-.45H.49V.01Q.36.38 0 .55Q-.36.38-.49.01ZM0-.23V.22M-.23 0H.23',
 fern:'M-.46.49Q-.34-.23.47-.52Q.46.42-.46.49ZM-.46.49L.33-.37M-.15.19l-.04-.33M-.03.08l.33.04M.12-.09l-.02-.26',
 lantern:'M-.37-.29H.37V.29H-.37ZM-.54-.34H.53M-.5.36H.5M0-.34V-.56M-.16-.22V.22M.16-.22V.22',
 clock:'M.54 0A.54.54 0 1 1-.54 0A.54.54 0 1 1 .54 0M0-.33V0L.24.15M-.40 0H-.48M.40 0H.48M0 .40V.47',
 lift:'M-.50.56V-.55H.50V.56M0-.28V.56M-.32-.11L-.16-.26M.32-.11L.16-.26',
 coffee:'M-.54-.13H.37V.16Q.37.38.18.40H-.34Q-.54.36-.54.10ZM.37-.10H.50Q.67-.10.61.09Q.56.20.37.20M-.35-.28Q-.15-.40-.30-.57M.04-.28Q.24-.40.09-.57',
 speech:'M-.55-.41H.55V.25H.13L-.28.52V.25H-.55ZM-.34-.16H.31M-.34.02H.15',
 signal:'M-.28.36H.28M-.30-.52Q-.60-.52-.60-.18Q-.60.09-.38.14L-.28.36V.52H.28V.36L.40.12Q.60.05.60-.18Q.60-.52.29-.52ZM-.33-.21H.33',
 compass:'M0-.57L.16-.15.57 0 .16.15 0 .57-.16.15-.57 0-.16-.15ZM-.38-.38L-.24-.24M.38.38L.24.24M-.38.38L-.24.24M.38-.38L.24-.24',
 vault:'M0-.56L.48-.29.48.29 0 .56-.48.29-.48-.29ZM.27 0A.27.27 0 1 1-.27 0A.27.27 0 1 1 .27 0M0-.28V.28M-.28 0H.28',
 briefing:'M-.50-.36H.5V.24H-.50ZM0 .24V.49M-.29.49H.29M-.31.01L-.10-.15.08-.04.28-.24',
 crystal:'M0-.61L.41-.14.30.31 0 .61-.30.31-.41-.14ZM0-.61L-.18-.13 0 .61 .18-.13ZM-.41-.14H.41'
};
const preference={
 '1-0':[0,-1],'1-1':[0,-1],'1-2':[1,0],'1-3':[0,1],'1-4':[0,-1],
 '2-1':[0,-1],'2-2':[0,1],'3-0':[-1,0],'3-1':[0,-1],'3-2':[1,-1],'3-3':[-1,1],
 '3-4':[1,0],'3-5':[0,1],'3-6':[0,-1],'3-7':[-1,-1],'4-1':[0,1]
};
export function craftPlacements(cells,cell,id) {
 if(!sceneCraft[id])return [];
 const [dx,dz]=preference[id], dist=(p,x,z)=>Math.hypot(p.x-x,p.z-z);
 const ordinary=cells.filter(p=>p.kind==='.');
 const first=ordinary.slice().sort((a,b)=>dist(a,dx*cell,dz*cell)-dist(b,dx*cell,dz*cell))[0];
 if(!first)return [];
 const second=ordinary.filter(p=>dist(p,first.x,first.z)>=cell*1.6).sort((a,b)=>dist(a,-dx*cell,-dz*cell)-dist(b,-dx*cell,-dz*cell))[0];
 return [first,second].filter(Boolean).map((p,i)=>({x:p.x,z:p.z,radius:cell*(i?.28:.44)}));
}

// Solid, low silhouettes on non-walkable ground only. Existing furniture, railings and
// walls win the placement check; use the same box/round/ball batches as the parent set.
export function dressSceneCraft(kit,maze,id) {
 const art=sceneCraft[id];if(!art)return 0;
 const h=maze.cell/2, feet=kit.groundContacts();
 let count=0;
 for(const side of [-1,1]){
  const slots=[[6.9,-4.6],[9.2,-4.6],[6.9,-9.2],[9.2,0],[12.6,-5.3],[9.2,4.6],[12.6,-12.5]];
  const found=slots.map(([x,z])=>[x*side,z]).find(([x,z])=>
   maze.blocked({x,z},.03)
   && !maze.walkCells.some(p=>Math.abs(x-p.x)<h+1.30&&Math.abs(z-p.z)<h+.92)
   && !feet.some(([fx,fz,w,d])=>Math.abs(x-fx)<w+1.22&&Math.abs(z-fz)<d+.95));
  if(!found)continue;
  const [x,z]=found,yaw=side*-.16;
  kit.place(x,z,yaw,p=>{
   const {base,ink,glint,frame}=art;
   if(frame==='garden'||frame==='rift'){
    p.round(0,.12,0,2.28,.24,1.52,base);
    p.ball(0,.32,-.08,.95,.38,.68,base);
    const tips=[[-.66,.68,.08,.37,.82],[.37,.74,-.24,.40,1.05],[.77,.35,.17,.27,.56],[-.15,.47,.24,.15,.49]];
    for(const [X,Y,Z,W,H] of tips){
     if(frame==='rift'){
      p.box(X,Y,Z,W,H,.29,ink);
      p.box(X-.07,Y+H*.44,Z+.012,W*.51,H*.17,.26,glint);
      p.box(X-W*.28,Y,Z+.146,.059,H*.74,.041,glint);
     }else{
      p.round(X,Y*.72,Z,.20,H*.88,.20,'#ceb493');
      p.ball(X,Y*.72+H*.42,Z,W,.26,W,ink);
      p.ball(X-.06,Y*.72+H*.51,Z+.04,W*.55,.104,W*.57,glint);
     }
    }
   }else{
    const tall=frame==='brass'?1.45:frame==='mat'?1.12:1.04;
    p.round(0,.14,0,2.35,.26,1.54,base);
    p.round(0,tall*.48,-.05,1.75,tall*.72,1.05,ink);
    p.box(0,tall*.51,.505,1.49,tall*.54,.13,base);
    p.round(0,tall*.94,-.06,1.90,.15,1.11,base);
    p.box(0,tall*1.00,.42,1.63,.047,.13,glint);
    for(const X of [-.67,.67]){
     p.round(X,tall*.51,.583,.13,tall*.59,.105,ink);
     p.box(X,tall*.29,.65,.102,.073,.018,glint);
    }
    for(const X of [-.38,0,.38])p.round(X,tall*.63,.59,.18,.12,.062,glint);
    if(frame==='paver'||frame==='court'){
     p.round(-.56,tall*1.09,-.17,.39,.23,.41,ink);
     p.ball(-.56,tall*1.24,-.17,.35,.28,.34,glint);
    }
   }
  });
  count++;
 }
 return count;
}
export function paintSceneCraft(c,cells,cell,id,uv,k) {
 const art=sceneCraft[id];if(!art)return;
 for(const {x,z,radius} of craftPlacements(cells,cell,id)){
  c.save();c.translate(uv(x),uv(z));c.scale(radius*k,radius*k);
  const soft=art.frame==='garden'||art.frame==='rift';
  const cloth=art.frame==='mat';
  const border=new Path2D(soft?'M-.89-.33Q-.64-.94-.12-.98Q.64-.91.89-.37Q.99.35.48.82Q.05.99-.57.75Q-.98.40-.89-.33Z':'M-.79-.91H.79L.94-.69V.69L.79.91H-.79L-.94.69V-.69Z');
  const finish=c.createLinearGradient(-.9,-.9,.86,.94);
  finish.addColorStop(0,art.ink+'22');finish.addColorStop(.34,art.base+'42');finish.addColorStop(1,art.base+'85');
  c.lineJoin='round';c.lineCap='round';
  c.save();c.translate(.025,.04);c.fillStyle=art.base+'4c';c.fill(border);c.restore();
  c.fillStyle=finish;c.fill(border);
  c.strokeStyle=art.ink+(soft?'4c':'84');c.lineWidth=.029;c.stroke(border);
  c.save();c.scale(.89,.89);c.lineWidth=.012;c.strokeStyle=art.glint+'82';c.stroke(border);c.restore();
  c.save();c.clip(border);
  for(let i=0;i<42;i++){
   const a=(Math.imul(i,8191)%997)/997,b=(Math.imul(i,1277)%743)/743;
   const xx=a*2-1,yy=b*2-1;
   c.strokeStyle=i%3===0?art.glint+'3b':art.base+'78';c.lineWidth=.012;
   c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+(cloth?.24:.055+b*.09),yy+(cloth?0:.019-a*.038));c.stroke();
  }
  c.restore();
  const emblem=new Path2D(stamp[art.motif]);
  c.save();c.translate(.032,.029);c.strokeStyle=art.base+'a2';c.lineWidth=.069;c.stroke(emblem);c.restore();
  c.lineWidth=.042;c.strokeStyle=art.ink+(soft?'a0':'c8');c.stroke(emblem);
  c.save();c.translate(-.015,-.019);c.strokeStyle=art.glint+'85';c.lineWidth=.013;c.stroke(emblem);c.restore();
  if(!soft)for(const X of [-.68,.68])for(const Y of [-.68,.68]){
   c.fillStyle=art.base+'b8';c.beginPath();c.arc(X,Y,.055,0,7);c.fill();
   c.fillStyle=art.glint+'aa';c.beginPath();c.arc(X-.012,Y-.016,.023,0,7);c.fill();
  }
  c.restore();
 }
}
