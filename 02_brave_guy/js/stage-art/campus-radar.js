import {drawMinimapSprite, minimapArtReady} from '../minimap-art.js?v=20261120assets';

const charts=new WeakMap();
function project(maze,S){
  let result=charts.get(maze);
  if(result?.size===S)return result;
  const {minX,maxX,minZ,maxZ}=maze.bounds,R=S/2,h=maze.cell/2;
  const cx=(minX+maxX)/2,cz=(minZ+maxZ)/2;
  const span=Math.max(...maze.walkCells.map(p=>Math.hypot(Math.abs(p.x-cx)+h,Math.abs(p.z-cz)+h)));
  const k=(R-37)/span;
  const X=x=>R+(x-cx)*k,Y=z=>R+(z-cz)*k;
  const base=document.createElement('canvas');base.width=base.height=S;
  const p=base.getContext('2d'), cell=maze.cell*k;
  p.fillStyle='#a6e485';p.strokeStyle='#cef3a3';p.lineWidth=1;
  for(const q of maze.walkCells)p.fillRect(X(q.x-h),Y(q.z-h),cell+.55,cell+.55);
  // Outline only the outer edges, not the seams between connected path cells.
  const cells=new Set(maze.walkCells.map(q=>[q.x,q.z].map(a=>Math.round(a/maze.cell)).join(',')));
  p.beginPath();
  for(const q of maze.walkCells){
    const x=X(q.x-h),y=Y(q.z-h),i=Math.round(q.x/maze.cell),j=Math.round(q.z/maze.cell);
    for(const [dx,dz,x1,y1,x2,y2] of [[0,-1,0,0,1,0],[1,0,1,0,1,1],[0,1,1,1,0,1],[-1,0,0,1,0,0]]){
      if(!cells.has([i+dx,j+dz].join(','))){p.moveTo(x+x1*cell,y+y1*cell);p.lineTo(x+x2*cell,y+y2*cell);}
    }
  }
  p.stroke();
  result={size:S,k,X,Y,base};charts.set(maze,result);return result;
}
function circle(c,x,y,r){
  c.beginPath();c.arc(x,y,r,0,Math.PI*2);
}
function mark(c,x,y,r,fill,edge='#142820'){
  circle(c,x,y,r);c.fillStyle=fill;c.fill();c.strokeStyle=edge;c.lineWidth=2;c.stroke();
}
export function paintCampusRadar(mini,maze,hero,enemies,hazards,ambush,locked){
  const {cv,ctx:c}=mini,S=cv.width,R=S/2,inner=R-22;
  const {k,X,Y,base}=project(maze,S);
  const art=minimapArtReady();
  cv.classList.toggle('art-loaded',art);
  c.clearRect(0,0,S,S);
  c.save();circle(c,R,R,inner);c.clip();
  c.fillStyle='#172d23';c.fillRect(0,0,S,S);
  if(art)drawMinimapSprite(c,'ground',R,R,2*inner);
  else {
    c.strokeStyle='#65816d';c.lineWidth=1.5;
    for(const d of [inner*.52,inner*.93]){circle(c,R,R,d);c.stroke();}
    c.beginPath();c.moveTo(R-inner,R);c.lineTo(R+inner,R);
    c.moveTo(R,R-inner);c.lineTo(R,R+inner);c.stroke();
  }
  c.globalAlpha=.44;c.drawImage(base,0,0);c.globalAlpha=1;
  for(const h of hazards){
    c.fillStyle='#fa435899';circle(c,X(h.pos.x),Y(h.pos.z),Math.max(3,h.r*k));c.fill();
  }
  // Distinct silhouettes: entry dot, courtyard ring, and school-door square.
  mark(c,X(maze.start.x),Y(maze.start.z),4.5,'#85d4ff');
  circle(c,X(maze.courtyard.x),Y(maze.courtyard.z),6);
  c.lineWidth=2.5;c.strokeStyle='#f6dd8b';c.stroke();
  c.fillStyle='#f9f4de';c.strokeStyle='#142820';c.lineWidth=2;
  c.fillRect(X(maze.exit.x)-4.5,Y(maze.exit.z)-4.5,9,9);
  c.strokeRect(X(maze.exit.x)-4.5,Y(maze.exit.z)-4.5,9,9);
  for(const e of enemies){
    if(e.state==='dead')continue;
    const boss=e.def.boss,elite=e.def.bar||e.def.armored||e.def.enrage||e.maxHp>=220||e.size>1.2;
    const x=X(e.pos.x),y=Y(e.pos.z),s=boss?22:elite?15:11;
    c.globalAlpha=e.state==='spawn'?.45:1;
    if(!drawMinimapSprite(c,boss?'boss':elite?'elite':'enemy',x,y,s))mark(c,x,y,s*.36,boss?'#c05cff':elite?'#ff9a2e':'#ff412f');
    if(e===locked){circle(c,x,y,s*.52+2);c.strokeStyle='#fff';c.lineWidth=2;c.stroke();}
  }
  c.globalAlpha=1;
  if(ambush&&!ambush.done){
    const x=X(ambush.pos.x),y=Y(ambush.pos.z);
    if(!drawMinimapSprite(c,'bear',x,y,19))mark(c,x,y,5,'#c5915c');
  }
  const hx=X(hero.pos.x),hy=Y(hero.pos.z),rotation=Math.PI-hero.yaw;
  if(!drawMinimapSprite(c,'hero',hx,hy,25,rotation)){
    c.save();c.translate(hx,hy);c.rotate(rotation);
    c.fillStyle='#ffd23c';c.strokeStyle='#131d15';c.lineWidth=2.5;
    c.beginPath();c.moveTo(0,-11);c.lineTo(8,0);c.lineTo(4,0);c.lineTo(4,9);
    c.lineTo(-4,9);c.lineTo(-4,0);c.lineTo(-8,0);c.closePath();c.stroke();c.fill();c.restore();
  }
  c.restore();
  if(art)drawMinimapSprite(c,'frame',R,R,S);
  else {
    circle(c,R,R,R-8);c.strokeStyle='#173623';c.lineWidth=13;c.stroke();
    circle(c,R,R,R-12);c.strokeStyle='#f2c942';c.lineWidth=4;c.stroke();
  }
}
