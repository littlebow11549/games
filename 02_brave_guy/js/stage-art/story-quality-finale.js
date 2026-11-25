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
 for(let j=0;j<rear.length;j++){
  k.place(rear[j],-20.3,0,p=>windowPane(p,{h:5.3,color:j%2?'#c9bdde':'#94b4d1',frame:'#71628e'}));
 }
 for(const s of [-1,1]){
  // Interior doubles as the shoulder of a room through a framed glass partition.
  k.place(s*4.6,-10.82,-s*.18,p=>{
   p.round(0,1.47,0,3.97,2.94,.39,'#6a5d89');
   p.round(0,1.93,.22,3.70,1.81,.09,s>0?'#8faebf':'#b49bc0');
   for(const x of [-1.83,0,1.83])p.round(x,1.61,.28,.13,2.72,.16,'#b497be');
   p.round(0,1.09,.27,3.56,.093,.16,'#d9bfce');
   p.sign(0,.60,.29,2.5,.32,s===1?'跨部門｜討論室':'跨部門｜會議室',ink,'#f0c4bd');
  });
  k.place(s*18.4,-4.6,-s*1.19,p=>{col(p,4.54,'#a993b6','#786689');});
  k.place(s*18.4,4.6,-s*1.3,p=>{filing(p,'#777d9c','#aa9dca');});
  k.place(s*17.8,13.80,-s*.17,p=>{planter(p,'#80a899','#8f789c');});
 }
}
function penthouse(k){
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
  palette:['#878aae','#b3b2cb','#3f3959','#76668a','#a993b2','#d3b6be'],ground:'carpet',backdrop:meeting,
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
