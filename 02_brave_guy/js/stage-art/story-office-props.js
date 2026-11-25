// Display-only volume landmarks for the local clapboard/cel office chapters.
// Dimensions are within one rim slot; +Z is toward the playable space.
const cream='#fff0d5', paper='#fffbed', charcoal='#344563', blue='#56739d', brass='#eab169';
const pink='#eb93a7', berry='#a45979', mint='#91d6c8', teal='#4b99a0', light='#bce6ec';
const periwinkle='#a8a5de', violet='#736b9f', walnut='#976f76', warm='#e6ba9b', leaf='#77b596';

function folder(p,x,y,z,color=periwinkle) {
  p.round(x,y,z,.64,.105,.46,color);
  p.round(x-.11,y+.055,z-.12,.30,.06,.18,color);
  p.round(x+.06,y+.054,z+.035,.38,.025,.23,paper);
}
function plant(p,x,y,z,s=1) {
  p.cyl(x,y+.22*s,z,.25*s,.18*s,.44*s,brass);
  p.cyl(x,y+.43*s,z,.26*s,.26*s,.10*s,warm);
  p.ball(x-.16*s,y+.65*s,z,.16*s,.26*s,.14*s,leaf);
  p.ball(x+.13*s,y+.75*s,z-.02*s,.17*s,.31*s,.15*s,teal);
  p.ball(x+.06*s,y+.63*s,z+.13*s,.12*s,.21*s,.17*s,mint);
}
function cup(p,x,y,z,c=pink) {
  p.cyl(x,y+.135,z,.095,.075,.27,c);
  p.cyl(x,y+.27,z,.102,.102,.055,paper);
  p.round(x,y+.115,z+.076,.13,.114,.033,cream);
}
function monitor(p,x,y,z,s=1,shell=blue,screen=light) {
  p.round(x,y+.49*s,z,1.09*s,.66*s,.20*s,shell);
  p.round(x,y+.50*s,z+.109*s,.88*s,.45*s,.034*s,screen);
  p.round(x,y+.59*s,z+.129*s,.46*s,.045*s,.021*s,paper);
  p.round(x-.09*s,y+.47*s,z+.129*s,.28*s,.043*s,.021*s,paper);
  p.round(x,y+.132*s,z-.02*s,.14*s,.32*s,.16*s,shell);
  p.round(x,y+.038*s,z+.07*s,.58*s,.08*s,.32*s,shell);
}
function desk(p,x,z,w,d,top=warm,legs=walnut) {
  p.round(x,1.24,z,w,.22,d,top);
  for(const u of [-1,1])for(const v of [-1,1]){
    p.round(x+u*(w/2-.20),.61,z+v*(d/2-.22),.17,1.21,.17,legs);
  }
  p.round(x,.77,z-d*.41,w-.30,.18,.12,legs);
}
function chair(p,x,z,c=teal,flip=1) {
  p.round(x,.58,z,.64,.20,.57,c);
  p.round(x,1.03,z-.23*flip,.64,.82,.18,c);
  p.round(x,.24,z,.13,.47,.13,charcoal);
  p.round(x,.082,z,.75,.13,.19,charcoal);
  p.round(x,.080,z,.19,.12,.65,charcoal);
}
function board(p,x,y,z,w,h,color=paleBoard) {
  p.round(x,y,z,w,h,.27,charcoal);
  p.round(x,y,z+.146,w-.21,h-.20,.058,color);
}
const paleBoard='#dbede9';
function note(p,x,y,z,color,dim=charcoal,size=1) {
  p.round(x,y,z,.48*size,.35*size,.06,color);
  p.round(x,y+.029*size,z+.038,.31*size,.024*size,.016,dim);
  p.round(x-.05*size,y-.043*size,z+.038,.21*size,.023*size,.016,dim);
}
function headset(p,x,y,z,s=1) {
  // Cushions and rounded arched band are separate solids; microphone jets out.
  for(const [dx,dy] of [[-.37,.0],[-.34,.20],[-.24,.38],[-.10,.46],[.10,.46],[.24,.38],[.34,.20],[.37,.0]]){
    p.ball(x+dx*s,y+dy*s,z,.105*s,.126*s,.085*s,charcoal);
  }
  p.round(x-.38*s,y-.13*s,z,.24*s,.34*s,.19*s,berry);
  p.round(x+.38*s,y-.13*s,z,.24*s,.34*s,.19*s,berry);
  p.round(x+.24*s,y-.27*s,z+.055*s,.32*s,.07*s,.07*s,charcoal);
  p.ball(x+.07*s,y-.27*s,z+.07*s,.091*s,.067*s,.063*s,pink);
}
function afterHours({at}) {
  at(0,p=>{
    desk(p,0,-.22,4.52,1.67,periwinkle,violet);
    monitor(p,-.30,1.35,-.47,1.53,violet,'#b9cbff');
    p.round(-.38,1.39,.41,1.16,.08,.43,cream);
    for(let i=0;i<6;i++) p.round(-.81+i*.172,1.442,.435,.116,.030,.106,'#c4a9d5');
    cup(p,1.22,1.35,.36,brass);
    for(let i=0;i<4;i++) folder(p,-1.63,1.39+i*.09,.21-i*.042,i%2?pink:mint);
    p.round(1.63,1.82,-.32,.48,.11,.34,violet);
    p.round(1.63,2.09,-.34,.075,.51,.082,cream);
    p.round(1.59,2.29,-.19,.10,.092,.39,cream);
    p.cyl(1.56,2.245,.02,.13,.26,.21,brass);
    p.ball(1.56,2.13,.03,.188,.071,.18,cream);
    chair(p,.12,1.31,berry,-1);
  });
  at(1,p=>{
    board(p,0,2.21,-.55,4.10,3.38,'#435675');
    p.box(0,2.10,-.376,.105,3.06,.08,violet);
    p.box(0,1.67,-.376,3.84,.092,.08,violet);
    p.box(0,.56,-.52,4.33,.11,.42,violet);
    p.ball(-.92,2.90,-.345,.39,.40,.060,cream);
    p.ball(-.74,3.02,-.276,.36,.36,.052,'#435675');
    for(const [x,y] of [[.49,3.3],[1.35,2.95],[.95,2.58],[-1.43,2.04],[.49,2.23]]) {
      p.round(x,y,-.326,.10,.036,.04,brass);
      p.round(x,y,-.321,.034,.103,.042,brass);
    }
    for(const [x,h,w] of [[-1.35,.65,.33],[-.79,1,.54],[-.25,.42,.39],[.46,.76,.45],[1.19,1.05,.45],[1.57,.43,.27]]) {
      p.round(x,.65+h*.5,-.317,w,h,.06,'#617195');
      p.round(x,.71+h*.64,-.275,.075,.075,.033,brass);
    }
  });
  at(2,p=>{
    p.round(0,.74,0,1.56,1.48,1.09,violet);
    for(const y of [.29,.73,1.17]){
      p.round(0,y,.58,1.36,.33,.13,periwinkle);
      p.round(0,y,.659,.36,.07,.08,cream);
    }
    folder(p,.08,1.54,.04,cream);
    p.round(0,2.20,-.058,1.6,.95,.19,brass);
    p.sign(0,2.20,.06,1.52,.84,'最佳員工',charcoal,cream);
  });
}
function timeClock({at}) {
  at(0,p=>{
    // Stuck at nine, both the oversized wall clock and punch reader tell it.
    p.round(0,1.72,-.3,3.29,3.43,.64,teal);
    p.round(0,1.81,-.01,3.08,3.02,.23,mint);
    p.ball(0,2.18,.195,1.05,1.05,.22,charcoal);
    p.ball(0,2.18,.365,.90,.90,.137,cream);
    for(let i=0;i<12;i++){
      const t=i*Math.PI/6;
      p.ball(Math.cos(t)*.75,2.18+Math.sin(t)*.75,.454,i%3?.044:.066,i%3?.044:.066,.046,teal);
    }
    p.round(-.245,2.18,.505,.57,.095,.067,charcoal);
    p.round(0,2.44,.504,.080,.61,.068,charcoal);
    p.ball(0,2.18,.533,.085,.085,.055,pink);
    p.round(0,.87,.325,1.68,.64,.26,blue);
    p.sign(0,.88,.474,1.52,.44,'09:00',mint,charcoal);
    p.round(0,.30,.26,1.27,.16,.105,charcoal);
    p.round(-.36,.34,.32,.30,.11,.105,pink);
  });
  at(1,p=>{
    p.round(0,1.08,-.45,5.1,2.16,.80,light);
    for(const x of [-2.03,2.03]) {
      p.round(x,1.51,-.26,.41,3.02,.53,teal);
      p.round(x,2.88,-.26,.59,.23,.65,brass);
    }
    p.round(0,2.89,-.27,4.42,.33,.47,teal);
    for(const x of [-.77,.77]){
      p.round(x,1.30,.00,1.47,2.55,.24,blue);
      p.round(x,1.47,.15,1.27,1.95,.061,light);
      p.round(x*.36,1.29,.20,.085,.36,.09,cream);
    }
    p.round(0,.10,.60,4.14,.17,1.36,periwinkle);
    p.sign(0,2.88,.02,2.50,.33,'一樓大廳',cream,teal);
  });
  at(3,p=>{
    p.round(0,.62,0,2.08,1.21,1.05,warm);
    p.round(0,1.18,.015,2.22,.20,1.13,brass);
    p.sign(0,.73,.568,1.75,.47,'失物招領',charcoal,cream);
    p.ball(-.26,1.34,.01,.38,.24,.31,'#ffce62');
    p.round(-.29,1.28,.27,.73,.10,.48,'#ffce62');
    p.ball(-.29,1.55,.01,.061,.05,.055,cream);
    p.round(.49,1.30,.18,.46,.080,.39,paper);
  });
}
function openPlan({at}) {
  at(0,p=>{
    // Two shared desk islands, with glazed rounded fabric partitions.
    for(const [x,c] of [[-1.1,mint],[1.18,periwinkle]]) {
      desk(p,x,.12,2.08,1.51,cream,teal);
      p.round(x,1.91,-.65,2.15,1.18,.20,c);
      p.round(x,2.47,-.648,2.14,.11,.23,paper);
      note(p,x-.69,2.07,-.517,pink,berry,.82);
      monitor(p,x,1.36,-.30,.92,blue,light);
      p.round(x+.03,1.407,.48,.65,.071,.28,charcoal);
      cup(p,x+.66,1.35,.38,warm);
      chair(p,x,1.25,teal,-1);
    }
  });
  at(1,p=>{
    p.round(-.76,.64,-.16,3.31,1.25,1.27,teal);
    p.round(-.76,1.28,-.13,3.39,.18,1.40,paper);
    for(const x of [-1.82,-.72,.39]){
      p.round(x,.66,.50,1.01,.89,.13,mint);
      p.round(x,.95,.60,.32,.063,.060,cream);
    }
    // Coffee maker and real solid jug/cupping supports.
    p.round(-1.44,1.75,-.18,.91,.79,.64,violet);
    p.round(-1.44,1.57,.16,.72,.49,.10,charcoal);
    p.round(-1.44,2.0,.11,.72,.21,.19,periwinkle);
    cup(p,-1.43,1.39,.28,pink);
    p.cyl(-.46,1.55,-.21,.36,.37,.42,brass);
    p.ball(-.45,1.73,-.21,.26,.23,.24,brass);
    p.ball(-.45,1.96,-.21,.083,.078,.08,cream);
    p.round(-.11,1.66,-.21,.31,.12,.13,warm);
    cup(p,.48,1.39,.25,mint);
    p.round(1.67,1.26,-.29,1.39,2.53,1.23,light);
    p.round(1.67,2.12,.37,1.18,.66,.23,blue);
    p.round(1.67,1.12,.37,1.18,1.24,.23,mint);
    p.round(1.35,1.94,.508,.09,.24,.08,cream);
    p.round(1.35,1.54,.508,.09,.38,.08,cream);
    note(p,1.87,1.44,.514,pink,violet,.67);
    p.sign(-.73,2.52,-.05,2.10,.43,'茶水間',cream,teal);
    p.round(-.73,2.52,-.132,2.23,.52,.13,teal);
  });
  at(2,p=>{
    p.cyl(0,.69,0,1.14,1.02,.17,warm,18);
    p.cyl(0,.34,0,.16,.23,.63,charcoal);
    cup(p,-.34,.77,.02,pink);cup(p,.43,.77,-.09,teal);
    plant(p,.07,.77,-.32,.72);
  });
}
function conference({at}) {
  at(0,p=>{
    // Long table, central conference mic and visible chair backs at each side.
    desk(p,0,.02,4.83,1.48,warm,violet);
    p.round(0,1.361,.026,2.42,.035,.42,cream);
    for(const x of [-1.54,0,1.54]){
      chair(p,x,-.92,blue,1);chair(p,x,1.03,periwinkle,-1);
      folder(p,x-.19,1.377,-.40,x===0?pink:mint);
      p.round(x+.12,1.4,.46,.42,.071,.30,paper);
    }
    p.round(.02,1.411,.081,.38,.095,.25,charcoal);
    p.round(.02,1.56,.067,.046,.22,.05,charcoal);
    p.ball(.02,1.67,.10,.086,.053,.085,charcoal);
    p.ball(.077,1.66,.11,.031,.030,.032,pink);
  });
  at(1,p=>{
    p.round(-1.70,.78,-.60,.24,1.55,.28,blue);
    p.round(1.70,.78,-.60,.24,1.55,.28,blue);
    board(p,0,2.09,-.56,4.58,2.24,'#ddecf9');
    p.round(-1.08,2.50,-.372,1.29,.085,.041,blue);
    for(let i=0;i<3;i++) p.round(-1.44+i*.33,2.06,-.373,.225,.48+i*.135,.057,[mint,teal,blue][i]);
    for(let i=0;i<3;i++) p.round(.65+(i%2)*.22,2.04-i*.19,-.364,1.01-i*.11,.064,.033,violet);
    p.round(0,3.39,-.48,1.79,.45,.33,berry);
    p.sign(0,3.39,-.288,1.66,.37,'會議中',cream,berry);
    for(const x of [-.68,.68]) p.ball(x,3.39,-.248,.081,.082,.052,pink);
  });
  at(2,p=>{
    p.round(0,.70,0,1.45,1.41,1.05,blue);
    p.round(0,1.43,.13,1.62,.18,1.21,periwinkle);
    p.round(0,.60,.558,1.14,.59,.12,teal);
    folder(p,0,1.55,.29,pink);plant(p,.52,1.52,-.18,.85);
  });
}
function service({at}) {
  at(0,p=>{
    // Individual deep solid booths, with pink foam mic and scarf-soft colors.
    for(const [x,shell] of [[-1.12,teal],[1.17,berry]]){
      desk(p,x,.06,2.09,1.53,cream,shell);
      p.round(x,1.99,-.64,2.02,1.40,.21,shell);
      p.round(x-1.0,1.71,-.08,.14,.70,1.15,shell);
      p.round(x,2.67,-.64,2.04,.13,.25,pink);
      monitor(p,x-.29,1.34,-.16,.83,blue,light);
      headset(p,x+.51,1.78,-.131,.68);
      cup(p,x+.65,1.35,.40,pink);
      chair(p,x-.05,1.22,shell,-1);
    }
    p.round(0,2.90,-.64,2.17,.49,.23,berry);
    p.sign(0,2.90,-.496,2.03,.383,'客服部',cream,berry);
  });
  at(1,p=>{
    p.round(-1.75,1.23,-.53,.26,2.47,.34,walnut);
    p.round(1.75,1.23,-.53,.26,2.47,.34,walnut);
    p.round(0,2.02,-.46,5.18,3.12,.31,walnut);
    p.round(0,2.03,-.283,4.94,2.84,.061,'#e5c6bd');
    p.round(0,3.23,-.232,4.66,.42,.09,berry);
    p.sign(0,3.24,-.171,3.73,.389,'匿名留言板',cream,berry);
    for(let j=0;j<3;j++) for(let i=0;i<6;i++){
      const x=(i-2.5)*.64+Math.sin(i*4.24+j*2.13)*.065;
      const y=2.78-j*.60+Math.cos(i*2.04-j*3.19)*.076;
      const c=[cream,paper,mint,periwinkle][(i+j*3)%4];
      if((i+j)%2===0) note(p,x,y,-.219,c,walnut,.99);
      else p.round(x,y,-.219,.475,.347,.060,c);
      if(i%3===j) p.ball(x-.12,y+.13,-.176,.034,.034,.038,berry);
    }
    p.round(.70,1.10,-.219,2.23,.39,.084,pink);
    p.sign(.70,1.10,-.163,2.21,.351,'怕成這樣還敢做夢？',berry,pink);
  });
  at(3,p=>{
    p.cyl(0,.39,0,.63,.70,.77,periwinkle);
    p.round(0,.82,0,1.47,.17,.96,light);
    headset(p,0,1.59,-.10,1.10);
    p.round(0,1.15,-.18,.095,.56,.09,blue);
    p.round(0,.92,-.04,.72,.09,.49,blue);
  });
}
const landmarks={'3-0':afterHours,'3-1':timeClock,'3-2':openPlan,'3-3':conference,'3-4':service};

export function addOfficeProps(stageId,kit) {
  if(!Object.prototype.hasOwnProperty.call(landmarks,stageId)) return false;
  landmarks[stageId](kit);
  return true;
}
