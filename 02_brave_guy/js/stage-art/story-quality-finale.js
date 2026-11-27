// Layered solid architecture for the last four chapters; landmark furniture is separate.
// North is -Z and outward / facade detail is +Z. p's Y values are object centers.
const cream='#fff0cc', ink='#343044', brass='#eeb95f', steel='#7789a1', plum='#756193';
const walnut='#82575c', blue='#8bb6cf', light='#feccac', black='#493a58';
const rear=[-15.9,-11.0,-6.1,6.1,11.0,15.9];
const panel=(p,width=4.55,height=5.3,color=plum,base=black)=>{
 p.round(0,height/2,0,width,height,.67,color);
 p.round(0,.24,.32,width,.48,.30,base);
 p.round(0,height-.13,.37,width,.27,.33,base);
};
const col=(p,h,color,accent,offset=0)=>{
 p.round(0,.24,offset,.94,.48,.93,accent);
 p.round(0,h*.51,offset,.73,h-.52,.67,color);
 p.round(0,h-.15,offset,1.10,.30,1.02,accent);
};
const windowPane=(p,{w=4.3,h=4.76,color=blue,frame=ink,night=false}={})=>{
 const center=h/2+.72;p.round(0,center,0,w,h,.41,frame);
 p.round(0,center,.215,w-.27,h-.30,.10,color);
 // Raised art-directed city forms; not a photographed billboard. 
 for(let j=0;j<7;j++){
  const x=(j-3)*w*.115,b=.7+[1.2,2.3,1.62,.6,2.0,2.65,1.3][j];
  p.round(x,.8+b/2,.29,w*.10,b,.11,night?['#51405f','#67537d','#79688b'][j%3]:['#66658c','#8086a7','#a28ca0'][j%3]);
  for(let i=0;i<4;i++){
   const y=1.08+i*.29;
   if(y<b+.61)p.round(x+((i+j)%2?.08:-.08),y,.36,.15,.12,.05,night?(j%2?'#edadd6':'#9dd3e6'):(j%2?'#feefb5':'#f7cdb9'));
  }
 }
 p.box(0,center,.38,.11,h,.13,frame);p.box(0,center+.94,.38,w,.11,.13,frame);
 p.round(0,.63,.24,w+.06,.21,.65,frame);
};
const rail=(p,color=brass)=>{
 p.round(0,.24,0,4.05,.48,.51,walnut);p.cyl(-1.64,.83,0,.11,.17,1.2,color,10);p.cyl(1.64,.83,0,.11,.17,1.2,color,10);
 p.round(0,1.37,0,4.15,.14,.24,color);
 for(const x of [-1.06,-.52,0,.52,1.06])p.round(x,.88,0,.09,.89,.11,color);
};
const planter=(p,color='#577c75',pot='#b37380')=>{
 p.round(0,.46,0,1.89,.87,.96,pot);p.round(0,.89,0,2.02,.17,1.02,cream);
 p.round(0,.99,0,1.73,.085,.79,'#765857');
 for(let i=0;i<9;i++){
  const j=(i+1)%3,r=[.26,.42,.37][j],y=1.16+(.17*(i%3));
  p.ball(-.75+i*.19,y,[-.14,.05,.22][j],r,.54+r*.15,.27,color);
 }
};
const filing=(p,color='#849aa7',drawer='#b3cdcd')=>{
 p.round(0,1.37,0,2.1,2.73,.98,color);
 for(let j=0;j<4;j++){
  p.round(0,.43+j*.57,.53,1.85,.42,.12,drawer);
  p.round(0,.42+j*.57,.63,.48,.095,.16,brass);
 }
};
const receptionLight=(p,accent=light)=>{
 p.cyl(0,.63,0,.11,.15,1.17,steel,10);
 p.cyl(0,1.26,0,.28,.37,.22,accent,14);
 p.ball(0,1.24,0,.23,.10,.23,cream);
};
function finance(k){
 // A recessed vault and warm account-window canopy give this floor a single destination.
 k.place(0,-21.0,0,p=>{
  p.box(0,2.96,-1.62,7.25,5.86,.72,'#61465a');
  p.round(0,2.38,-1.19,5.44,4.41,.30,'#a67a75');
  p.round(0,2.45,-.95,4.35,3.83,.27,'#74546d');
  p.round(0,2.31,-.76,2.83,2.77,.145,'#a47680');
  for(const x of [-3.14,3.14]){
   p.round(x,2.63,.19,.74,5.26,.81,'#997789');
   p.round(x,.25,.23,1.12,.50,1.08,'#c29783');
   p.round(x,5.16,.24,1.11,.34,.92,'#e4b37f');
   p.round(x,2.32,.52,.32,2.61,.16,'#ffe2a2');
  }
  p.round(0,5.36,.23,7.48,.60,.91,'#96708a');
  p.sign(0,5.36,.71,3.07,.49,'財務金庫','#ffedc8','#614957');
  p.round(0,.15,.30,5.9,.28,1.45,'#aa806f');
  for(const x of [-.90,.90]){
   p.round(x,2.09,-.61,.70,.7,.14,'#e2a982');
   p.ball(x,2.10,-.52,.16,.16,.1,'#fff1bd');
  }
 });
 for(const s of [-1,1])k.place(s*17.5,10.15,-s*1.02,p=>{
  p.round(0,.30,0,5.3,.60,2.29,'#604d64');
  p.round(0,.83,-.12,4.77,1.09,1.63,'#97777c');
  p.round(0,1.36,.13,4.94,.17,2.08,'#cca581');
  for(const x of [-1.44,0,1.44]){
   p.round(x,.78,.65,1.24,.69,.11,'#ad8b88');
   p.round(x,.90,.75,.39,.09,.16,'#e7b989');
  }
 });
 for(let j=0;j<rear.length;j++){
  k.place(rear[j],-20.3,0,p=>{
   panel(p,4.85,5.45,['#857783','#b19384','#948085'][j%3],'#706078');
   for(const x of [-1.9,1.86]){
    p.round(x,2.61,.41,.22,4.81,.26,'#c99f82');
    p.round(x,.41,.53,.40,.41,.46,brass);
   }
   if(j===1||j===4){
    p.round(0,3.06,.407,3.17,3.12,.14,'#bfa073');
    p.cyl(0,3.08,.56,1.11,1.11,.15,'#dbb982',20);
    p.sign(0,3.55,.641,2.05,.47,j===1?'現金保管':'年終覆核',ink,cream);
    p.round(0,2.75,.635,1.85,.19,.17,brass);
    for(const x of [-.84,-.37,.09,.56,.96])p.ball(x,2.75,.747,.068,.067,.041,cream);
   }else{
    for(const h of [1.06,2.22,3.40,4.58])p.round(0,h,.50,3.35,.18,.23,'#dab18e');
   }
  });
 }
 for(const s of [-1,1]){
  k.place(s*4.6,-10.72,0,p=>{filing(p,'#7a6d83','#baa39c');});
  k.place(s*18.4,-5.1,-s*.87,p=>{col(p,4.5,'#aa8990','#805f73');receptionLight(p);});
  k.place(s*18.4,4.6,-s*1.27,p=>{filing(p);});
  k.place(s*17.8,13.85,-s*.18,p=>{planter(p,'#916f8b','#816f88');});
 }
}
function meeting(k){
 // A continuous lintel and recessed upper frieze join the side bays.
 k.place(0,-22.42,0,p=>{
  p.box(0,7.52,-.62,39.1,4.42,.55,'#3b3c54');
  p.box(0,9.51,-.18,39.3,.46,.72,'#4d465e');
  p.round(0,9.35,.24,39.2,.14,.26,'#7e6577');
  p.box(0,7.19,.09,37.9,.20,.45,'#544d67');
  for(const x of [-15.8,-10.5,-5.25,5.25,10.5,15.8]){
   p.box(x,8.31,-.24,4.56,1.39,.29,'#45435c');
   p.box(x,7.57,.10,4.59,.13,.24,'#726277');
   p.round(x,8.30,-.04,3.25,.77,.12,'#4c4b66');
  }
  p.round(0,8.15,-.03,4.75,1.37,.36,'#55475d');
  p.round(0,8.15,.15,4.35,1.09,.18,'#675669');
  p.ball(0,8.15,.27,.34,.34,.068,'#ac7e79');
  p.round(0,8.15,.33,.22,.83,.086,'#d29979');
  p.box(0,3.66,-.56,39.5,7.32,.51,'#374159');
  p.round(0,6.76,0,39.8,.55,.62,'#4a4967');
  p.round(0,6.53,.29,39.24,.12,.25,'#a17e7d');
  for(const x of [-13.1,-9.0,-4.9,0,4.9,9.0,13.1]){
   p.round(x,5.95,.03,3.49,.48,.16,'#35374e');
   p.round(x,5.76,.12,3.31,.075,.15,'#8c6d73');
  }
 });
 for(const x of [-8.42,8.42])k.place(x,-19.95,0,p=>{
  col(p,5.8,'#545370','#484759');
  p.round(0,4.04,.38,.47,.79,.22,'#745a6a');
  p.round(0,4.12,.54,.25,.43,.13,'#ffca89');
  p.round(0,3.84,.5,.49,.07,.25,'#b1826c');
 });
 for(let j=0;j<rear.length;j++){
  const x=rear[j];
  k.place(x,-20.8,0,p=>{
   if(j===0||j===5){windowPane(p,{h:4.15,color:'#8bafc4',frame:'#263c58',night:true});return;}
   panel(p,4.96,j===2||j===3?5.63:6.44,'#3e4b68','#283a55');
   p.round(0,2.54,.39,4.15,2.65,.14,j<3?'#60768d':'#76647f');
   for(const ix of [-1.61,-.84,-.04,.76,1.55])
    p.round(ix,2.50,.51,.057,2.24,.12,j<3?'#819eaa':'#9e7c91');
   p.round(0,1.42,.54,4.14,.115,.22,'#d49968');
   p.round(0,3.74,.46,3.28,.16,.12,'#b18871');
  });
 }
 k.place(0,-20.68,0,p=>{
  // The return walls and raised hem give the opening actual depth at play zoom.
  // All surfaces sit behind the exit so the existing route/colliders remain intact.
  // Carved threshold and layered surrounds continue the floor into the opening.
  p.round(0,.10,-.04,5.9,.19,1.35,'#55495f');
  p.round(0,.22,-.20,5.60,.12,1.14,'#a47972');
  p.round(0,.29,-.43,5.08,.07,.83,'#cb9d83');
  for(const s of [-1,1]){
   p.round(s*2.54,1.01,-1.40,.39,1.78,.33,'#c38d76');
   p.round(s*2.61,1.78,-1.23,.49,.13,.42,'#eabc91');
   p.round(s*3.65,2.36,.41,.30,4.61,.46,'#4d4058');
   p.round(s*3.65,.28,.44,.63,.54,.59,'#756072');
  }
  p.box(0,2.50,-2.18,7.35,5.08,.39,'#252238');
  p.round(0,2.28,-1.92,5.36,4.50,.25,'#b8775d');
  p.round(0,2.81,-1.72,4.25,2.90,.16,'#e2a47a');
  p.round(0,2.46,-1.59,3.85,2.08,.12,'#c78e7d');
  p.box(0,1.53,-1.49,3.8,.12,.13,'#f2b680');
  p.round(0,3.36,-1.43,2.17,.68,.15,'#493951');
  p.sign(0,3.36,-1.32,1.98,.53,'聯席會議','#fff0cd','#654957');
  for(const x of [-3.02,3.02]){
   p.box(x,2.40,-.83,.69,4.77,2.44,'#664656');
   p.round(x,2.33,.32,.88,4.64,.65,'#ab7160');
   p.round(x,2.34,.65,.26,3.91,.15,'#f7c47e');
   p.round(x,4.35,.45,1.19,.32,.94,'#ffd18d');
   p.round(x,.23,.53,1.20,.46,1.07,'#4d425c');
   p.ball(x,1.72,.80,.15,.20,.11,'#ffe1a5');
  }
  p.round(0,4.57,-.09,7.19,1.13,1.76,'#463951');
  p.round(0,5.03,.08,7.52,.26,1.82,'#77637a');
  p.round(0,4.43,.83,5.05,.14,.29,'#e5b18f');
  p.sign(0,4.82,.98,3.38,.47,'聯席會議','#fff0cd','#6a4c5d');
  p.ball(0,4.73,1.05,.18,.18,.09,'#ffe3ae');
 });
 k.place(-4.6,-10.82,.16,p=>{
  // Dispatch wall: folded notices and a low cabinet give the left side one visual job.
  p.round(0,.55,0,3.75,1.10,.95,'#344660');
  p.round(0,1.12,.07,3.91,.16,1.12,'#c18d68');
  for(const xx of [-1.15,0,1.15]){p.round(xx,.56,.48,1.04,.73,.13,'#59647c');p.round(xx,.66,.56,.28,.08,.14,'#edb887');}
  p.round(0,2.25,.05,3.90,1.92,.49,'#252e48');
  p.round(0,2.26,.34,3.58,1.57,.13,'#8b676d');
  p.round(0,3.25,.22,4.07,.19,.71,'#cf9975');p.round(0,3.14,.58,2.86,.10,.14,'#ffd196');
  p.sign(0,2.95,.43,2.88,.31,'案件派發','#fff3ca','#405169');
  for(let i=0;i<5;i++){
   const x=(i-2)*.60, y=2.21+(i%2)*.17;
   p.round(x,y,.433,.42,.46,.06,['#fff1b2','#e99e90','#b1d9d7'][i%3]);
   p.ball(x,y+.14,.48,.035,.035,.029,'#634c65');
   p.round(x,y-.01,.47,.29,.036,.035,'#805f6c');
  }
 });
 k.place(4.6,-10.82,-.15,p=>{
  // Amber shelving opposite the briefing wall, with restrained detail off the walk surface.
  p.round(0,1.62,0,3.84,3.24,.74,'#3f3851');
  p.round(0,1.47,.38,3.47,2.49,.11,'#73566b');
  for(const h of [.54,1.26,1.99,2.71])p.round(0,h,.50,3.42,.13,.54,'#d1926d');
  for(let i=0;i<7;i++)p.round((i-3)*.40,.92+(i%2)*.07,.56,.24,.57,.30,['#c393ab','#e7b785','#84aaa8'][i%3]);
  p.sign(0,2.91,.43,2.40,.32,'會議資料','#fff3ca','#594560');
 });
 // The non-walkable central island is a low reading garden rather than an
 // empty raised rectangle. Keep the silhouette below a standing hero.
 k.place(0,9.20,0,p=>{
  p.round(0,.21,0,7.56,.42,2.14,'#4c4057');
  p.round(0,.48,0,7.03,.38,1.83,'#8b6679');
  p.round(0,.69,0,6.89,.13,1.85,'#be958c');
  p.round(0,.76,-.03,6.57,.09,1.63,'#554556');
  p.round(-2.22,.81,.12,1.24,.106,1.11,'#967866');
  p.round(2.28,.81,.12,1.24,.106,1.11,'#987b71');
  for(let i=0;i<10;i++){
   const x=-1.52+i*.34;
   p.ball(x,.87+(i%3)*.07,(i%2)*.24-.16,.30,.22,.29,['#758f85','#678d80','#9a9e77'][i%3]);
   if(i%3===1)p.ball(x-.06,1.06,.20,.17,.13,.16,'#d2a9a2');
  }
  for(const x of [-2.22,2.28]){
   p.box(x,.88,.16,.81,.07,.74,'#c38978');
   p.round(x,.93,.16,.74,.055,.66,'#d7b38e');
   p.box(x,1.00,.39,.43,.027,.06,'#ae8379');
  }
 });
 // Frame the outer corridors with contiguous architecture. The plinths,
 // pilasters and lit alcoves are out of the existing maze footprint.
 for(const s of [-1,1]){
  k.place(s*17.25,1.6,-s*Math.PI/2,p=>{
   p.box(0,1.74,0,31.2,3.48,.88,'#43495f');
   p.round(0,.39,.54,31.36,.78,1.05,'#50475e');
   p.round(0,.70,1.01,31.32,.16,.21,'#a08383');
   p.round(0,3.49,.05,31.52,.38,1.09,'#5e586f');
   p.round(0,3.34,.64,31.52,.13,.30,'#846b80');
   for(const [i,x] of [-12.1,-7.23,-2.41,2.41,7.23,12.1].entries()){
    const lit=(i+(s===1?1:0))%3===0;
    p.round(x,2.02,.50,3.96,2.25,.29,'#363a51');
    p.round(x,2.02,.67,3.58,1.99,.09,lit?'#84667a':'#5c5a73');
    p.round(x,1.13,.84,3.93,.124,.48,'#786182');
    for(const dx of [-.72,.72])p.box(x+dx,1.99,.73,.072,1.79,.09,lit?'#b18c8d':'#78778a');
    p.box(x,2.66,.735,3.50,.078,.10,lit?'#bd9490':'#8b7d91');
    if(lit){
     p.round(x,2.22,.79,1.27,.60,.11,'#bc907f');
     p.round(x,2.23,.87,1.02,.43,.095,'#f6c28f');
     p.round(x,1.89,.89,.76,.085,.22,'#ce9b88');
    }
   }
   for(const x of [-14.48,-9.62,-4.82,0,4.82,9.62,14.48]){
    p.round(x,.27,.81,1.21,.54,.88,'#554b63');
    p.round(x,1.96,.68,.66,2.80,.69,'#656179');
    p.round(x,3.25,.83,1.11,.33,.92,'#84768c');
    p.round(x,1.98,1.03,.09,2.16,.09,'#938197');
   }
  });
 }
 // A low foreground sill closes the visual room without blocking player view.
 k.place(0,17.80,0,p=>{
  p.box(0,.25,0,34.2,.50,.53,'#51465c');
  p.round(0,.56,0,34.2,.17,.76,'#887080');
  for(const x of [-15.18,-10.0,-5.0,0,5.0,10.0,15.18]){
   p.round(x,.57,.0,1.02,1.14,.79,'#63546b');
   p.round(x,1.15,.01,1.11,.17,.88,'#a38186');
  }
  for(const s of [-1,1]){
   p.round(s*15.75,.29,.52,2.9,.58,1.55,'#4a425b');
   p.round(s*15.75,.91,.52,1.05,1.48,1.13,'#685873');
   p.round(s*15.75,1.66,.51,1.37,.28,1.33,'#8c707c');
   p.round(s*15.75,1.93,.51,.52,.36,.56,'#e5b196');
   p.round(s*15.75,2.16,.51,.74,.14,.75,'#aa7f81');
  }
 });
 // Two distinct near-edge reading nooks. All geometry is out on the
 // blocked outer island; nothing sticks into the centre of the route.
 k.place(-14.25,11.65,.22,p=>{
  p.round(0,.18,0,4.82,.36,2.02,'#484259');
  p.round(.15,.48,0,4.4,.34,1.75,'#614b66');
  p.round(-.05,.88,-.51,4.3,1.11,.60,'#785d79');
  p.round(-1.49,.67,.14,1.02,.36,1.09,'#c18786');
  p.round(-.36,.68,.14,1.08,.34,1.11,'#a97987');
  p.round(.72,.67,.14,1.02,.34,1.09,'#aa8191');
  p.ball(.67,1.02,-.35,.35,.26,.23,'#d8a7a5');
  p.round(1.82,.67,.06,.31,.44,1.37,'#a77b86');
  p.round(-2.34,.19,-.62,.69,.40,.64,'#45374f');
  p.cyl(-2.34,.73,-.62,.10,.13,.86,'#a77873',10);
  p.cyl(-2.34,1.23,-.62,.24,.36,.35,'#e8b79d',14);
  p.ball(-2.34,1.13,-.62,.26,.10,.24,'#fbd5a8');
 });
 k.place(14.15,10.92,-.33,p=>{
  p.round(0,.26,0,3.76,.52,1.88,'#524862');
  p.round(0,.66,0,3.52,.67,1.61,'#6d5c76');
  p.round(0,.99,.05,3.66,.22,1.72,'#a9899d');
  for(let i=0;i<7;i++){
   const x=(i-3)*.37;
   p.ball(x,1.18+(i%3)*.14,-.04+(i%2)*.19,.39,.43,.42,['#698d7d','#749786','#a2a879'][i%3]);
   p.ball(x-.12,1.36+(i%3)*.14,.13+(i%2)*.18,.19,.21,.21,'#9aab91');
  }
  p.round(0,.70,.82,3.29,.09,.06,'#bc96a2');
 });
 for(const s of [-1,1]){
  k.place(s*18.4,-4.6,-s*1.19,p=>{col(p,4.54,'#66738d','#465470');});
  k.place(s*18.4,4.6,-s*1.3,p=>{filing(p,'#777d9c','#aa9dca');});
  k.place(s*17.8,13.80,-s*.17,p=>{planter(p,'#80a899','#8f789c');});
 }
}
function penthouse(k){
 // The roof ends at a skyline terrace, with low railings on the front layers.
 k.place(0,-22.2,0,p=>{
  p.round(0,.25,0,39.0,.49,1.35,'#6e4b69');
  p.round(0,.53,.25,39.1,.14,1.29,'#c49794');
  p.round(0,1.22,.34,38.7,.12,.24,'#e5ae8d');
  for(let i=0;i<15;i++){
   const x=-18.7+i*2.68,h=.98+[2.0,2.7,1.64,3.1,.6,1.85][i%6];
   p.round(x,.89,0,.14,.76,.22,'#ba908d');
   p.box(x,h*.50+1.44,-3.82,2.05,h,1.2,['#6f5877','#8a667e','#a57b90'][i%3]);
   if(i%3===0)for(const dx of [-.57,.10,.62])for(const y of [2.16,2.70]){
    p.box(x+dx,y,-3.20,.13,.12,.045,'#dfb4a3');
   }
  }
 });
 for(const s of [-1,1])k.place(s*16.75,12.0,-s*.90,p=>{
  p.round(0,.24,0,4.62,.49,1.83,'#775467');
  p.round(0,.66,.17,4.13,.44,1.57,'#b67e8e');
  p.round(0,1.0,-.49,4.1,.98,.43,'#936680');
  p.round(-1.28,.99,.18,.66,.29,.68,'#c19aa1');
  p.round(1.24,.99,.20,.65,.29,.66,'#e0aa99');
 });
 k.place(0,18.84,0,p=>{
  p.round(0,.27,0,32.15,.56,.81,'#775773');
  p.round(0,.59,.09,32.31,.13,.90,'#be8b96');
  for(const x of [-14,-9.35,-4.68,0,4.68,9.35,14])p.round(x,.70,0,.58,1.04,.66,'#aa768a');
 });
 for(let j=0;j<rear.length;j++){
  k.place(rear[j],-20.2,0,p=>{
   windowPane(p,{w:4.8,h:6.35,color:j%2?'#d1a8b5':'#c492a9',frame:'#5e3e66'});
   p.round(0,7.29,.31,4.82,.34,.83,'#8e5f76');
   if(j===1||j===4)p.ball(.9,5.67,.385,.43,.43,.066,'#ffdb93');
  });
 }
 for(const s of [-1,1]){
  k.place(s*18.4,-9.2,-s*1.05,p=>{col(p,5.88,'#8c657d','#e0aa74');});
  k.place(s*18.4,-3.0,-s*1.57,p=>rail(p,'#e6b96f'));
  k.place(s*18.4,2.37,-s*1.57,p=>rail(p,'#e6b96f'));
  k.place(s*18.4,7.8,-s*1.57,p=>rail(p,'#e6b96f'));
  k.place(s*17.8,13.85,-s*.17,p=>planter(p,'#979274','#865b79'));
 }
}
function nightmare(k){
 // Build an irregular crystal ravine along the existing outer wall, not on the lanes.
 for(const s of [-1,1]){
  for(let i=0;i<4;i++)k.place(s*(16.45+i*.46),-9.95+i*7.35,-s*.34,p=>{
   const h=2.37+(i%3)*.80;
   p.round(0,.24,0,4.67,.48,5.32,'#483c62');
   p.round(-.78,h*.34,.13,2.52,h*.72,4.41,'#65527d');
   p.round(.63,h*.50,-.26,2.17,h,2.96,'#79648f');
   p.round(-.12,h*.76,.17,1.56,.31,2.47,'#947db2');
   p.cone(-.90,h*.63,.69,.27,.93,'#ad96d6',5);
   p.cone(.41,h+.35,-.18,.43,1.65,'#c598d9',5);
  });
 }
 k.place(0,-21.35,0,p=>{
  p.box(0,3.25,-2.2,8.33,6.48,.66,'#44324f');
  p.round(0,2.69,-1.28,5.08,4.72,.57,'#6f507e');
  p.round(0,2.67,-.89,3.98,3.89,.17,'#9b659d');
  p.round(0,2.71,-.77,2.96,3.19,.14,'#7a468f');
  for(const t of [-1,1]){
   p.cone(t*1.32,2.30,-.61,.37,3.47,'#e2a2d3',5);
   p.cone(t*2.19,1.35,-.51,.41,1.97,'#ac8cc7',5);
   p.round(t*1.97,.24,.08,1.68,.48,1.25,'#8a6094');
  }
  p.round(0,5.27,-.28,6.37,.39,.87,'#a482b5');
  p.ball(0,4.92,.28,.33,.38,.13,'#f0bedf');
 });
 for(let j=0;j<rear.length;j++){
  k.place(rear[j],-20.1,(j<3?1:-1)*.10,p=>{
   const h=j===0||j===5?4.85:5.95;
   panel(p,4.71,h,'#463651','#352a49');
   p.round(0,h/2+.14,.374,3.75,h-.72,.10,j===1||j===4?'#57436a':'#554566');
   if(j===1||j===4){
    for(let i=0;i<4;i++){
     const x=(i-1.5)*.53;
     p.round(x,2.1+i*.32,.46,.27,3.05-i*.17,.12,'#a37cbe');
     p.ball(x,3.67+i*.18,.61,.11,.16,.08,'#fac2df');
    }
   }else{
    p.round(0,2.7,.49,1.96,.24,.16,'#75518a');
    p.sign(0,3.0,.52,2.14,.45,j===0||j===5?'放棄？':'玫良鑫',cream,'#614970');
   }
  });
 }
 // A deep rear threshold with thick, angled buttresses frames the ending route.
 for(const s of [-1,1]){
  k.place(s*3.65,-20.05,s*.17,p=>{
   col(p,6.05,'#6e548c','#a078af');
   p.round(0,5.9,.13,1.55,.45,.77,'#cda4d6');
   p.cyl(0,6.45,.13,.06,.35,.70,'#db93bd',7);
   p.round(0,3.56,.48,.25,1.59,.18,'#edd3fa');
  });
  k.place(s*13.8,-9.2,-s*.25,p=>{
   col(p,4.47,'#695381','#9874ae');
   p.round(.01,2.96,.44,.32,1.44,.16,'#df9ec6');
   p.sign(0,1.5,.51,.78,.33,'算了',cream,'#5f496b');
  });
  k.place(s*18.4,1.75,-s*1.2,p=>{col(p,4.08,'#67517e','#8e729a');});
  k.place(s*17.8,13.85,0,p=>planter(p,'#975987','#6f587e'));
 }
}
export const FINALE_QUALITY=Object.freeze({
 '3-6':{
  rows:['####E####','#.......#','#..###..#','#...B...#','##..S..##','##.....##','##.#.#.##','##.....##','#########'],
  palette:['#b08469','#dcb88f','#463643','#876b77','#d3a382','#e4b979'],ground:'wood',backdrop:finance,
 },
 '3-7':{
  rows:['####E####','##......#','##.###..#','##..B..##','##..S..##','##.....##','##.###.##','##.....##','#########'],
  palette:['#7c8590','#b4a9a4','#273951','#53546a','#9c8090','#dda879'],ground:'carpet',backdrop:meeting,
 },
 '3-5':{
  rows:['####E####','#.......#','#.##.##.#','#...B...#','##..S..##','##.....##','###...###','###...###','#########'],
  palette:['#a26e70','#caa48e','#44304e','#805a7b','#bc87a3','#eabb7a'],ground:'wood',backdrop:penthouse,
 },
 '4-1':{
  rows:['####E####','###...###','##..#..##','##..B..##','##..S..##','##.....##','##.###.##','##.....##','#########'],
  palette:['#776180','#a584a7','#352945','#5b486e','#996d9f','#e3aacd'],ground:'fracture',backdrop:nightmare,
 },
});
