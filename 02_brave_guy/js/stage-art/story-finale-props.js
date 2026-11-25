// Four stage-specific sets. All decoration is volumetric, within its own landmark slot.
const cream='#fff2cc', ink='#302845', pink='#fd8db3', gold='#ffbf57', teal='#45cabe';
const dark='#382841', lavender='#c1abec', rose='#d24772';
const desk=(p,x,z,w,d,body,top)=>{
 p.round(x,.63,z,w-.13,1.15,d-.18,body);
 p.round(x,1.22,z,w,.20,d,top);
};
const book=(p,x,y,z,w,h,d,cover)=>{
 p.round(x,y,z,w,h,d,cover);
 p.box(x+w*.067,y,z+.028,w*.82,h*.62,d*.999,cream);
 p.round(x-w*.44,y,z,w*.11,h*.98,d,cover);
};
const plant=(p,x,z,color=teal)=>{
 p.cyl(x,.21,z,.33,.24,.42,'#f18d9d',9);
 p.cyl(x,.445,z,.32,.32,.04,'#674a4a',9);
 for(const [dx,dz,h] of [[-.17,0,.70],[.14,.01,.85],[.05,-.13,1.01],[-.11,.13,.86]])
  p.ball(x+dx,h,z+dz,.17,.29,.14,color);
};
const binderShelf=(p,color)=>{
 p.round(0,1.09,0,2.75,2.14,.82,color);
 p.round(0,1.09,.42,2.51,1.86,.06,dark);
 for(const level of [.52,1.36]){
  p.round(0,level,.54,2.54,.10,.23,cream);
  ['#db6b90','#ebbc5b','#69b0b9','#8f8ade','#e99479'].forEach((c,i)=>{
   const x=-.82+i*.41;
   p.round(x,level+.30,.48,.30,.52,.38,c);
   p.box(x,level+.23,.70,.13,.14,.03,cream);
   p.ball(x,level+.42,.70,.040,.040,.026,ink);
  });
 }
};
const windowUnit=(p,x,w,glass='#4d88af')=>{
 p.round(x,1.86,-.52,w,3.38,.34,'#302a55');
 p.round(x,1.87,-.32,w-.19,3.17,.06,glass);
 for(let j=0;j<4;j++){
  const ix=x+(j-1.5)*w*.22,h=[.81,1.22,1.81,1.06][j];
  p.round(ix,.29+h/2,-.26,w*.15,h,.10,j%2?'#56638d':'#72759e');
  for(let k=0;k<3;k++)p.box(ix,.45+k*.19,-.196,.12,.065,.035,'#ffe4a4');
 }
 p.box(x,1.95,-.18,w,.074,.08,ink);p.box(x,1.87,-.18,.074,3.15,.08,ink);
};
const seat=(p,x,z,color)=>{
 p.round(x,.51,z,.76,.26,.75,color);
 p.round(x,.88,z-.35,.79,.69,.23,color);
 p.cyl(x,.23,z,.069,.069,.38,ink,8);
 p.cyl(x,.066,z,.35,.35,.13,ink,9);
};
const pot=(p,x,y,z,r,color)=>{
 p.cyl(x,y+r*.46,z,r*.87,r*.68,r*.85,color,18);
 p.cyl(x,y+r*.89,z,r*.90,r*.90,r*.12,'#82708e',18);
 p.cyl(x,y+r*.96,z,r*.73,r*.73,r*.044,'#312536',18);
 for(const s of [-1,1])p.round(x+s*r,y+r*.67,z,r*.46,r*.15,r*.36,color);
};
const windowSide=(kit,i,glass)=>kit.at(i,p=>windowUnit(p,0,3.00,glass));
const sets={
 '3-6'(k){
  k.at(0,p=>{
   desk(p,0,0,4.4,1.73,'#7662a0','#f8b9ba');
   p.sign(0,.73,.96,3.12,.42,'財務部｜年終帳',ink,'#ffd992');
   p.round(-.79,1.68,-.10,1.02,.76,.56,'#6c6d98');
   p.round(-.79,1.73,.204,.74,.35,.05,'#b3efe1');
   p.sign(-.79,1.73,.241,.64,.23,'結帳',ink,'#b3efe1');
   for(let r=0;r<2;r++)for(let c=0;c<3;c++)p.round(-1.03+c*.24,1.44,.24+r*.21,.16,.076,.16,pink);
   for(let i=0;i<4;i++)book(p,.76,1.36+i*.12,.16,1.06,.12,.78,['#de6189',teal,'#ea914d','#788fde'][i]);
   for(let i=0;i<3;i++)p.cyl(1.65,1.35+i*.056,.40,.18,.18,.055,gold,16);
  });
  k.at(1,p=>{
   p.round(0,.84,0,1.86,1.65,1.28,'#7991ac');p.round(0,.85,.673,1.58,1.31,.09,'#485571');
   p.cyl(.01,.86,.748,.41,.41,.08,'#a7b9dc',16);
   for(let i=0;i<6;i++){
    const a=i*Math.PI/3;p.ball(Math.cos(a)*.27,.86+Math.sin(a)*.27,.805,.063,.063,.038,'#dfe6fa');
   }
   p.round(.0,.86,.82,.42,.13,.13,gold);
   p.sign(0,1.43,.735,1.20,.24,'現金庫',cream,ink);
  });
  k.at(2,p=>binderShelf(p,'#9081c5'));
  k.at(3,p=>{for(let i=0;i<3;i++)book(p,0,.28+i*.39,0,1.82,.36,1.17,['#a279c8','#e8a55d','#d76587'][i]);plant(p,1.08,.35);});
 },
 '3-7'(k){
  k.at(0,p=>{
   p.cyl(0,.61,0,.60,.80,1.16,'#555273',14);
   p.cyl(0,1.20,0,1.67,1.53,.22,'#f7ab84',24);
   p.cyl(0,1.326,0,1.51,1.51,.041,'#ffe0ac',24);
   seat(p,-1.73,0,'#c77b9e');seat(p,1.73,0,'#8c8bd5');seat(p,0,-1.79,'#6fc6c1');
   pot(p,0,1.35,0,.60,'#594c69');
   for(const x of [-.92,.91]){ p.round(x,1.35,.36,.36,.045,.51,cream);p.box(x,1.377,.35,.24,.015,.03,'#c9a5b8');}
  });
  k.at(1,p=>{
   for(const x of [-1.27,1.27])p.round(x,1.01,0,.16,2.02,.35,'#7f7494');
   p.round(0,2.19,0,3.5,1.8,.27,'#6c6284');
   p.round(0,2.21,.162,3.27,1.52,.06,'#f4ffe5');
   p.sign(0,2.62,.207,2.95,.39,'跨部門｜責任歸屬',ink,'#c9e4bf');
   for(let i=0;i<3;i++){const x=-.83+i*.83;p.round(x,2.13,.22,.57,.34,.07,['#ffc092','#bea9ef','#92ddc9'][i]);}
   p.sign(0,1.76,.227,2.0,.25,'這不是我的業務',rose,'#fce1bf');
  });
  k.at(2,p=>{pot(p,-.57,.05,0,.57,'#784c64');pot(p,.70,.05,-.12,.46,'#745b85');plant(p,1.52,.1,'#88be90');});
  k.at(3,p=>binderShelf(p,'#8c869e'));
 },
 '3-5'(k){
  k.at(0,p=>{
   desk(p,0,.05,4.23,1.61,'#4f3865','#b68183');
   p.round(0,.75,.83,3.22,.54,.115,'#6c4884');
   p.sign(0,.76,.91,2.49,.36,'冠老闆｜總經理',cream,'#5a3d72');
   p.round(0,1.40,-.91,1.79,.40,.91,'#7b446d');
   p.round(0,2.06,-1.12,1.86,1.55,.45,'#79547f');
   p.round(0,2.17,-.867,1.44,1.23,.13,'#9d6e91');
   for(const x of [-1.1,1.1])p.round(x,1.54,-.85,.33,.31,.88,'#ae879b');
  });
  k.at(1,p=>{
   p.cyl(0,.33,0,1.01,1.12,.64,'#684f78',12);
   p.cyl(0,.68,0,1.07,1.07,.17,'#ad829a',12);
   p.cyl(0,.90,0,.73,.85,.34,'#e9a75b',12);
   for(let i=0;i<8;i++){
    const a=2*Math.PI*i/8,x=Math.cos(a)*.65,z=Math.sin(a)*.65;
    p.cone(x,1.24+(i%2)*.075,z,.20,.53+(i%2)*.15,gold,7);
    p.ball(x,1.55+(i%2)*.16,z,.11,.103,.11,'#ffda7e');
   }
   p.ball(0,.93,.80,.19,.13,.063,'#ee77a0');
   p.sign(0,.52,1.11,1.54,.26,'年度最佳',cream,'#8b657e');
  });
  windowSide(k,2,'#566c9a');windowSide(k,3,'#627fa4');
  k.at(4,p=>plant(p,0,0,'#aebf9b'));
 },
 '4-1'(k){
  k.at(0,p=>{
   desk(p,0,.1,4.12,1.62,'#38294f','#7f619e');
   p.round(0,.77,.96,3.46,.64,.083,'#62477d');
   p.sign(0,.75,1.02,2.88,.39,'董事長室',cream,'#4d3a68');
   p.round(0,1.49,-.92,1.50,.34,.84,'#674d7d');
   p.round(0,2.1,-1.06,1.54,1.65,.33,'#544268');
   p.round(0,2.08,-.85,1.25,1.37,.09,'#9573ab');
   p.round(.79,1.343,.18,.95,.068,.65,cream);
   for(let i=0;i<4;i++)p.box(.79,1.39,.06+i*.10,.58-i*.05,.016,.035,'#9f77a5');
  });
  k.at(1,p=>{
   p.round(0,.25,0,2.19,.42,1.17,'#645083');
   // Layered open portal posts support an upright lavender mirror, with visible solid sides.
   p.round(0,1.87,-.04,2.1,3.05,.31,'#a47ac9');
   p.round(0,1.87,.154,1.71,2.60,.14,'#6b568b');
   p.round(0,1.85,.251,1.42,2.30,.12,'#3f375b');
   p.sign(0,1.87,.332,1.11,.52,'算了',cream,'#58466f');
   for(const s of [-1,1]){
    p.round(s*1.03,1.26,.27,.19,1.54,.18,'#cb9eda');
    p.ball(s*.99,2.87,.22,.19,.25,.16,'#f4afd2');
    p.ball(s*.86,.78,.34,.15,.23,.14,'#a885d7');
   }
   p.ball(0,3.35,.09,.28,.30,.20,'#df9bc9');
  });
  windowSide(k,2,'#686680');
  k.at(3,p=>{
   p.round(0,.92,0,2.40,1.74,.91,'#6b5279');
   p.round(0,1.85,0,2.56,.16,1.01,'#aa85b0');
   p.round(0,2.13,.17,.95,.54,.30,ink);
   p.round(0,2.13,.348,.84,.42,.04,'#9addcd');
   p.box(.37,2.27,.375,.22,.15,.028,'#ffc2cd');
   p.sign(.37,2.265,.404,.19,.12,'還行',ink,'#ffc2cd');
   p.round(0,1.94,.18,.2,.13,.33,ink);
   plant(p,.91,.11,'#b58ad4');
  });
 },
};
export function addFinaleProps(stageId, kit){
 const set=sets[stageId];
 if (!set) return false;
 set(kit);
 return true;
}
