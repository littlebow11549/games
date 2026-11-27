// Rear silhouettes belong behind the existing sets. Their spacing and outline
// are scene-specific; they are not colliders and are invisible on the radar.
const campus={
 '1-2':['#638979','#bad0a4','#678f89'],
 '1-3':['#8c676f','#bd8f7b','#6f5e78'],
 '1-4':['#6f648b','#9485aa','#674f7b'],
 '2-1':['#355a59','#548171','#386e62'],
 '2-2':['#5a516e','#906f83','#605471'],
};
const room={
 '1-0':['#a77d8c','#b38d91','#785c79',5.8,'logs'],
 '3-0':['#515a7b','#7d819d','#4c4d6e',7,'desk'],
 '3-1':['#74929e','#a9bbc0','#5d7784',8.5,'lobby'],
 '3-2':['#648079','#9fa98b','#526d68',5.5,'pantry'],
 '3-3':['#565972','#847896','#55546f',6.7,'board'],
 '3-4':['#5f778c','#879bac','#526981',7.1,'service'],
 '3-6':['#614b66','#987484','#59475c',7.9,'vault'],
};
export function buildSceneHorizon(kit,id){
 const outdoor=campus[id];
 if(outdoor){
  const [low,lit,mid]=outdoor;
  kit.place(0,-25.8,0,p=>{
   if(id==='2-1'){
    for(let i=0;i<13;i++){
     const x=-21+i*3.53,h=4.1+[1.8,3.4,2.4,.7][i%4],z=-1.25+(i%3)*.48;
     p.box(x,h*.41,z,.64,h*.82,.63,i%2?low:mid);
     p.ball(x,h,z,3.08,2.38,1.74,i%3?mid:lit);
     p.ball(x-1.21,h-.54,z-.45,2.06,1.63,1.87,low);
    }
   }else if(id==='2-2'){
    for(let i=0;i<8;i++){
     const x=(i-3.5)*5.68,h=2.4+(i%3)*1.08,z=-(i%2)*2.2;
     p.box(x,h/2,z,4.73,h,2.08,low);
     p.round(x,h+.15,z-.28,5.11,.54,2.51,mid);
     p.round(x,h+.48,z-.83,4.07,.36,1.75,lit);
     p.box(x-.98,h*.51,z+1.062,.49,.51,.047,'#bd978f');
     if(i%2)p.box(x+.9,h*.51,z+1.062,.55,.51,.047,'#d5a28b');
    }
   }else{
    p.round(0,.47,0,43.7,.94,1.36,low);
    p.round(0,1.03,.17,43.7,.20,1.48,lit);
    for(let i=0;i<11;i++){
     const x=(i-5)*4.20;
     if(id==='1-2'){
      p.box(x,1.65,-.05,.18,3.3,.19,mid);
      p.box(x,2.83,.10,3.94,.078,.1,mid);
     }else{
      p.round(x,1.61,.06,.91,3.21,1.32,mid);
      p.round(x,3.28,.21,1.04,.18,1.35,lit);
      p.box(x+2.0,2.34,-.18,3.00,.14,.17,mid);
     }
    }
   }
  });
  return;
 }
 const interior=room[id];if(!interior)return;
 const [base,trim,deep,h,theme]=interior;
 kit.place(0,-25.6,0,p=>{
  p.box(0,h*.5,-.45,43.7,h,.84,base);
  p.round(0,h-.20,.13,43.65,.38,.69,deep);
  p.box(0,h-.44,.45,43.45,.11,.11,trim);
  p.box(0,1.06,.07,43.55,1.86,.24,deep);
  const count=theme==='lobby'?7:9;
  for(let i=0;i<count;i++){
   const x=(i-(count-1)/2)*(42.2/count),d=(42.2/count)-.69;
   p.box(x,1.10,.23,.28,2.1,.32,trim);
   p.round(x,h*.60,.05,d,h*.39,.20,deep);
   p.box(x,h*.60,.172,d-.34,h*.39-.30,.045,base);
   p.box(x,h*.42,.215,d-.40,.085,.102,trim);
   if(theme==='pantry')for(const xx of [-.67,0,.67]){
    p.round(x+xx,h*.56,.24,.35,.54,.15,i%3?trim:'#d3be8d');
   }else if(theme==='lobby'||theme==='service'){
    p.box(x-.42,h*.64,.23,1.0,h*.26,.045,trim);
    p.box(x+.56,h*.64,.23,.75,h*.26,.045,trim);
   }else if(i%2===0){
    p.round(x,h*.65,.22,1.13,.65,.10,trim);
   }
  }
 });
}
const entries={
 '3-0':['#51405b','#a57a6b','#e4b07d','#694f66','加班區',.70],
 '3-1':['#4f7987','#9ec1c5','#cbe3dc','#608a99','電梯大廳',.83],
 '3-2':['#648070','#b5ac79','#edd9a5','#799486','茶水間',.62],
 '3-3':['#565470','#87839c','#c3b9d8','#6e6983','會議室',.59],
 '3-4':['#4e637d','#86a0b2','#b1d5de','#68849b','客服區',.65],
};
export function buildSceneThreshold(kit,id){
 const e=entries[id];if(!e)return;
 const [frame,trim,lit,recess,label,style]=e;
 // Set a real recess immediately beyond the existing exit and avoid adding
 // a visual collider across its walk cell.
 kit.place(0,-22.02,0,p=>{
  const w=style*7.20;
  p.box(0,1.75,-.88,w+.75,3.57,.32,frame);
  p.round(0,1.75,-.66,w-.40,3.46,.22,recess);
  p.round(0,1.56,-.51,w-1.16,2.88,.13,lit);
  p.round(0,1.54,-.40,w-1.42,2.74,.13,recess);
  for(const h of [.41,1.12,1.86,2.57])p.box(0,h,-.30,w-1.48,.048,.07,trim);
  const post=w*.50;
  for(const s of [-1,1]){
   p.round(s*post,1.68,.16,.45,3.36,.62,frame);
   p.round(s*post,1.67,.47,.27,3.07,.13,trim);
   p.box(s*post,1.66,.57,.073,2.44,.065,lit);
  }
  p.round(0,3.46,.15,w+.68,.42,.65,frame);
  p.round(0,3.22,.48,w-.35,.082,.25,lit);
  p.sign(0,3.49,.57,Math.min(w-1.05,2.14),.35,label,lit,recess);
  p.round(0,.12,.09,w+.22,.24,1.01,trim);
 });
}
