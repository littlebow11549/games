// Art-direction and low-impact 3D architecture for the story office chapters.
// Placement coordinates are world X/Z; façades face +Z before kit yaw.
const oak='#a16e6c', deep='#39485e', navy='#485475', ink='#46455c';
const amber='#ffd097', soft='#ffebc4', snow='#eef7e9', ivory='#f3e5cf';
const teal='#689c9c', leaf='#74ac8b', mint='#acd3b6', cyan='#bcdbe5';
const blue='#7f99b0', mauve='#9d83a2', cherry='#a95c7f', pink='#f2adbc';
const cold='#6a739c', glaze='#879db8', plum='#635879';
const turn=Math.PI/2;

function upright(p,x,z,h,w,d,body,trim,tip=trim) {
  p.round(x,h/2,z,w,h,d,body);
  p.round(x,.15,z,w+.23,.30,d+.14,trim);
  p.round(x,h-.12,z,w+.14,.25,d+.11,trim);
  p.round(x,h-.12,z+d*.52,w*.65,.105,.075,tip);
}
function wall(p,w,h,body,trim,skirt=trim,z=0) {
  p.round(0,h/2,z,w,h,.88,body);
  p.round(0,.27,z+.49,w-.04,.52,.21,skirt);
  p.round(0,.68,z+.51,w-.14,.135,.155,trim);
  p.round(0,h-.37,z+.52,w-.14,.23,.26,trim);
  p.round(0,h-.17,z+.51,w+.14,.085,.24,skirt);
}
function window(p,x,y,z,w,h,frame,glass,shine) {
  p.round(x,y,z,w,h,.31,frame);
  p.round(x,y,z+.18,w-.24,h-.25,.095,glass);
  p.round(x,y-h*.44,z+.215,w+.16,.17,.36,frame);
  p.round(x,y,z+.238,.10,h-.25,.06,frame);
  p.round(x,y+.35*h,z+.239,w-.26,.066,.052,shine);
  p.round(x-.36*w,y+.085*h,z+.24,.050,h*.45,.05,shine);
}
function lowShelf(p,x,z,w,h,skin,shadow,books) {
  p.round(x,h/2,z,w,h,.91,skin);
  for(const f of [.28,.64]){
    const y=h*f;
    p.round(x,y,z+.47,w-.24,h*.28,.09,shadow);
    p.round(x,y-h*.15,z+.52,w-.17,.075,.14,skin);
    for(let i=0;i<6;i++){
      const xx=x+(i-2.5)*w*.116, hh=h*(.10+((i*7)%4)*.035);
      p.round(xx,y-h*.13+hh/2,z+.55,w*.083,hh,.15,books[i%books.length]);
    }
  }
  p.round(x,h,z+.02,w+.13,.15,1.0,skin);
}
function radiator(p,x,z,w,color,cap) {
  p.round(x,.57,z,w,.80,.45,color);
  for(let i=0;i<10;i++)p.round(x+w*(i-4.5)/10,.56,z+.24,w*.07,.65,.09,cap);
  p.round(x,.96,z+.07,w+.12,.10,.54,cap);
}
function cactus(p,x,y,z,s,body,bright,pot) {
  p.cyl(x,y+.27*s,z,.27*s,.20*s,.54*s,pot);
  p.cyl(x,y+.54*s,z,.29*s,.28*s,.13*s,pot);
  p.ball(x,y+.80*s,z,.16*s,.33*s,.14*s,body);
  p.ball(x-.14*s,y+.77*s,z+.06*s,.17*s,.18*s,.12*s,bright);
  p.ball(x+.14*s,y+.94*s,z,.13*s,.22*s,.14*s,bright);
}
function bench(p,w,skin,shade,z=0) {
  p.round(0,.48,z,w,.27,.84,skin);
  p.round(0,.73,z-.37,w,.53,.16,skin);
  p.round(-w*.39,.23,z,.17,.44,.65,shade);
  p.round(w*.39,.23,z,.17,.44,.65,shade);
  p.round(0,.58,z+.024,w-.14,.10,.78,shade);
}
function pendent(p,x,z,y,shade,light) {
  p.round(x,y+.52,z,.061,1.0,.073,shade);
  p.cyl(x,y+.06,z,.29,.48,.26,shade,12);
  p.ball(x,y-.059,z,.429,.07,.429,light);
}
function dashes(p,x,z,w,ink) {
  for(let i=0;i<5;i++)p.round(x+(i-2)*w*.175,.032,z,w*.107,.031,.094,ink);
}
function liftPanel(p,x,z,metal,highlight,wallColor) {
  p.round(x,2.09,z,3.31,4.16,.62,wallColor);
  p.round(x,1.93,z+.32,2.83,3.56,.22,deep);
  for(const m of [-1,1]){
    p.round(x+m*.63,1.89,z+.452,1.24,3.37,.10,metal);
    p.round(x+m*.71,1.85,z+.511,.044,3.09,.029,highlight);
    p.round(x+m*1.34,1.93,z+.455,.104,3.56,.13,highlight);
  }
  p.round(x,3.74,z+.415,2.74,.15,.22,highlight);
  p.round(x+1.66,1.38,z+.40,.23,.53,.22,deep);
  p.ball(x+1.66,1.44,z+.525,.057,.064,.042,mint);
  p.ball(x+1.66,1.28,z+.525,.057,.060,.042,ivory);
}

function nightShift({place}) {
  // Two dark city-window walls flank the illuminated rear egress. Amber work
  // lights against lilac-gray carpet locate the inhabited area.
  for(const s of [-1,1]){
    place(s*8.0,-19.8,s*-.055,p=>{
      wall(p,10.0,5.45,'#657292','#8b94b5','#444d70');
      for(const x of [-3.05,0,3.05])window(p,x,3.14,.56,2.55,2.75,'#535576','#3d4b71','#a2a7ca');
      for(const [x,y] of [[-3.66,3.06],[-2.73,2.41],[-.69,2.70],[.65,3.49],[2.75,3.27],[3.74,2.95]]){
        p.round(x,y,.831,.105,.079,.028,amber);
      }
      for(const x of [-4.93,4.93])upright(p,x,.44,5.41,.43,.56,navy,plum,amber);
    });
    place(s*16.45,-9.9,-s*turn,p=>{
      wall(p,8.7,4.26,'#74748d','#9294ae','#635f7e');
      for(const x of [-2.93,0,2.93])window(p,x,2.65,.52,2.46,1.97,navy,'#92a3c4','#c8c4d1');
      radiator(p,0,.89,2.32,plum,'#a8a1b4');
    });
    place(s<0?-13.45:4.58,-11.10,s*.13,p=>{
      lowShelf(p,0,.02,3.25,1.47,'#817589','#565b79',[mauve,amber,'#9fa7c6']);
      cactus(p,s*.91,1.54,-.05,1.15,teal,leaf,'#bb8799');
      p.round(-s*.53,1.60,.07,.84,.12,.53,'#e7b484');
    });
    place(s<0?-17.04:12.6,6.8,-s*.39,p=>{
      bench(p,2.72,'#887f9e','#a99db1');cactus(p,s*1.71,0,-.21,.99,teal,leaf,plum);
    });
  }
  place(0,-20.4,0,p=>{
    p.round(0,4.67,.12,4.74,1.06,1.03,plum);
    p.round(0,4.34,.68,4.96,.16,.27,'#aba3b7');
    p.round(0,4.53,.703,2.51,.32,.16,ink);
    p.sign(0,4.52,.794,2.29,.27,'夜間出口',amber,ink);
    for(const s of [-1,1])upright(p,s*2.47,0,4.27,.59,.77,navy,plum,amber);
  });
}
function towerLobby({place}) {
  // Twin elevator banks and high clerestory: a light-rich, tall lobby,
  // one material family through wall, lifts, railing and low marble planters.
  for(const s of [-1,1]){
    place(s*7.9,-19.8,0,p=>{
      wall(p,10.18,5.77,'#90b5bf','#d0ded7','#668899');
      liftPanel(p,-2.23,.53,'#83a6b9','#cbe4dd','#81a6b4');
      liftPanel(p,2.23,.53,'#83a6b9','#cbe4dd','#81a6b4');
      for(const x of [-4.65,0,4.65])upright(p,x,.39,5.52,.42,.72,'#acc5c8','#d6ded2','#91babc');
      for(const x of [-2.25,2.25]){
        p.round(x,4.58,.66,1.94,.41,.15,deep);
        p.round(x,4.58,.755,1.61,.25,.075,'#c8dbd7');
      }
    });
    place(s*17.10,-6.9,-s*turn,p=>{
      wall(p,10.3,4.94,'#9dbfc8','#d2dfd8','#809aa9');
      for(const x of [-3.2,0,3.2])window(p,x,2.96,.49,2.64,3.11,'#c5d5d4','#abcdda','#e1eee8');
      bench(p,5.88,'#94adb9','#c4d4cf',1.09);
    });
    place(s*9.55,-11.24,0,p=>{
      p.round(0,.34,0,3.12,.66,1.46,'#7b9aaa');
      p.round(0,.68,0,3.32,.23,1.64,'#ccd8d0');
      for(const x of [-1,0,1])cactus(p,x,.76,.02,1.11,teal,leaf,'#bcc8a8');
    });
    place(s*15.37,4.3,-s*.22,p=>{
      bench(p,3.24,'#adc2c3','#d2dbcb');
      p.round(s*2.0,.34,0,.61,.66,.61,'#799bab');
      p.round(s*2.0,.67,0,.73,.10,.73,ivory);
    });
  }
  place(0,-20.15,0,p=>{
    p.round(0,5.0,0,4.5,.74,.88,'#86a6b8');
    p.round(0,4.50,.13,4.86,.37,.99,'#bbd2d2');
    p.sign(0,4.55,.698,2.74,.32,'出口大廳',snow,'#557789');
    for(const s of [-1,1])upright(p,s*2.33,0,4.32,.57,.74,'#a8c1c8','#d4ded2',ivory);
  });
  place(0,3.0,0,p=>{
    for(const s of [-1,1])dashes(p,s*3.30,0,2.68,'#b4a97e');
  });
}

function pantryFloor({place}) {
  // Conversion of the old court: the lime lattice of bench rows, warm
  // pantry tile and a separate copper serving counter establish zones.
  place(-8,-19.7,.05,p=>{
    wall(p,9.65,4.85,'#8a9d88','#bed0a8','#70877e');
    for(const x of [-3,0,3])window(p,x,2.92,.54,2.54,2.43,'#748f89','#afcbb1','#d8dcb4');
    radiator(p,.06,.90,3.03,'#879b8e','#b1bf9d');
  });
  place(8,-19.7,-.05,p=>{
    wall(p,9.65,4.85,'#baab83','#d7c796','#938b70');
    for(const x of [-3,-1,1,3]){
      p.round(x,2.83,.55,1.77,2.43,.21,'#d8caa1');
      p.round(x,2.86,.671,1.56,2.23,.049,'#efdbaf');
      for(const y of [2.23,3.05])p.round(x,y,.72,1.54,.062,.088,'#bda883');
    }
    p.sign(0,4.22,.67,4.10,.37,'茶水・咖啡',soft,'#956b5c');
  });
  place(-16.4,-8.2,turn,p=>{
    wall(p,10.45,4.32,'#8da692','#b4c4a5','#687e7b');
    for(const x of [-3,0,3]){
      window(p,x,2.66,.56,2.52,2.13,'#718d86','#b5c6b3','#e3e1c3');
      radiator(p,x,.84,1.56,'#829b8a','#abc2a7');
    }
  });
  place(18.05,-7.4,-turn,p=>{
    wall(p,9.7,3.78,'#b6a482','#d4bc9b','#8e806b');
    for(const x of [-3.05,0,3.05])lowShelf(p,x,.86,2.62,1.74,'#9e8e75','#777765',[ivory,mint,'#c39877']);
    p.round(0,1.88,1.02,8.92,.20,1.31,'#d1a882');
    for(const x of [-3.2,-1.06,1.06,3.2])pendent(p,x,.94,3.39,'#a06e55',soft);
  });
  place(-9.5,-10.18,.07,p=>{
    lowShelf(p,0,0,3.11,1.32,'#9cb29e','#6a8480',[ivory,'#d89f80',mint]);
    cactus(p,.78,1.40,.05,.94,leaf,teal,'#e1ae78');
  });
  place(4.60,-11.01,-.065,p=>{
    for(const x of [-1.35,0,1.35])upright(p,x,0,2.15,1.23,.80,'#aebea4','#8a9e94',soft);
    p.round(0,2.22,.09,4.11,.14,1.01,'#d7c499');
  });
  place(-14.3,7.86,.34,p=>{bench(p,3.4,'#89a58e','#a8bf97');cactus(p,-2.03,0,-.06,1.08,leaf,teal,'#cda377');});
  place(17.73,7.95,-.36,p=>{bench(p,3.4,'#b79776','#d2b391');cactus(p,2.1,0,-.06,1.04,leaf,teal,'#cda377');});
  place(0,-20.14,0,p=>{
    p.round(0,4.05,.12,4.56,.43,.72,'#889985');
    p.round(0,4.27,.13,4.74,.14,.81,'#b5c49f');
    for(const s of [-1,1])upright(p,s*2.43,0,3.97,.46,.63,'#a5ac88','#819687',ivory);
  });
}
function boardroom({place}) {
  // Deep acoustic ribs, dark mahogany door/rear framed wall, slate floor.
  // The open battle floor retains conference logic and no furniture collision.
  for(const s of [-1,1]){
    place(s*7.7,-19.73,-s*.026,p=>{
      wall(p,9.95,5.34,'#73758c','#9b95aa','#565676');
      for(const x of [-3.16,0,3.16]){
        p.round(x,2.67,.545,2.91,3.33,.20,'#626983');
        p.round(x,2.68,.688,2.69,3.13,.074,'#85829f');
        for(const k of [-2,-1,0,1,2])p.round(x+k*.43,2.67,.752,.045,2.93,.06,'#747b96');
      }
    });
    place(s*16.25,-6.8,-s*turn,p=>{
      wall(p,10.0,4.81,'#8a828f','#b1a0a5','#696a87');
      for(const x of [-3,0,3]){
        p.round(x,2.75,.576,2.67,2.88,.22,'#71637c');
        p.round(x,2.76,.711,2.43,2.65,.075,'#96879b');
        p.round(x,3.84,.77,2.19,.055,.054,'#c5adac');
        p.round(x,1.66,.77,2.19,.055,.054,'#c5adac');
      }
      for(const x of [-4.28,4.28])upright(p,x,.62,4.73,.32,.43,plum,mauve,ivory);
    });
    place(s<0?-9.7:4.6,-10.96,s*.06,p=>{
      p.round(0,.64,.02,3.19,1.25,.96,'#827181');
      p.round(0,1.29,.06,3.31,.17,1.03,'#b18f88');
      p.round(0,.62,.53,2.80,.71,.128,'#9b838d');
      for(const x of [-.79,.79])p.round(x,.71,.61,.62,.069,.094,'#ccab9a');
      cactus(p,s*.93,1.37,.10,1,teal,leaf,plum);
    });
    place(s*13.1,8.1,-s*.37,p=>bench(p,3.4,'#807389','#a798a5'));
  }
  place(0,-20.53,0,p=>{
    p.round(0,4.44,.09,4.68,.45,.92,'#786b83');
    p.round(0,4.61,.09,4.81,.115,.96,'#a29198');
    for(const s of [-1,1])upright(p,s*2.48,0,4.23,.54,.89,plum,mauve,pink);
    p.sign(0,4.44,.59,2.37,.34,'會議走廊',ivory,plum);
  });
}
function callFloor({place}) {
  // Dense but clean booth geometry is behind player routes, not a forest of
  // combat obstructions. A dedicated wall with old notices warms the cold room.
  place(-8,-19.8,.05,p=>{
    wall(p,9.86,5.15,'#7d9ba5','#aebfc3','#678396');
    for(const x of [-3,0,3]){
      window(p,x,3.0,.57,2.62,2.42,'#698895','#9ab5c4','#d2dade');
      p.round(x,1.10,.59,2.51,.35,.26,'#b1a4ae');
    }
  });
  place(8,-19.8,-.05,p=>{
    wall(p,9.86,5.15,'#9891a8','#c7b4c1','#857d9a');
    for(const x of [-3,0,3]){
      p.round(x,2.88,.55,2.67,2.63,.25,'#8e758c');
      p.round(x,2.88,.701,2.43,2.40,.075,'#c9a5aa');
      for(let i=0;i<6;i++){
        const xx=x+.58*(i%3-1), y=3.47-.80*(i>=3)+.085*Math.sin(i*2.2);
        p.round(xx,y,.755,.43,.57,.075,[soft,'#ead0bb',pink,mint][i%4]);
        p.round(xx,y+.06,.804,.30,.039,.021,'#a38492');
        p.round(xx-.035,y-.05,.803,.225,.032,.021,'#a38492');
      }
    }
  });
  for(const s of [-1,1]){
    place(s*16.92,-7.75,-s*turn,p=>{
      wall(p,9.8,4.17,s<0?'#8ca8ad':'#a49aaf',s<0?'#b2c2c4':'#c5b8c2','#6d8297');
      for(const x of [-3.25,-1.08,1.08,3.25]){
        p.round(x,1.38,.80,2.02,2.68,.46,s<0?'#7ca2a8':'#a07992');
        p.round(x,.79,1.095,1.84,1.34,.11,s<0?'#9bb8b7':'#cda5ae');
        p.round(x,2.20,1.10,1.84,.88,.11,s<0?'#9cb4c1':'#b5acc1');
        p.round(x,1.74,1.16,1.84,.080,.096,'#e1c9c4');
        p.ball(x-.75,2.52,1.18,.088,.081,.055,snow);
      }
    });
    place(s<0?-4.6:10.02,-11.00,s*.065,p=>{
      p.round(0,.68,0,2.89,1.38,.87,s<0?teal:cherry);
      p.round(0,1.34,.067,3.04,.17,1.01,'#d2b4be');
      for(const x of [-.85,0,.85]){
        p.round(x,.69,.457,.77,1.07,.09,s<0?'#acc7c4':'#c7a0b0');
        p.round(x,1.031,.52,.42,.073,.087,ivory);
      }
      cactus(p,s*.89,1.42,-.13,.87,teal,leaf,'#bc87a3');
    });
    place(s<0?-17.62:13.55,6.96,-s*.34,p=>{
      bench(p,2.84,s<0?teal:cherry,s<0?'#9ebcc4':'#c896ad');
      cactus(p,s*1.81,0,0,1.00,teal,mint,plum);
    });
  }
  place(0,-20.12,0,p=>{
    p.round(0,4.32,0,4.48,.63,.84,'#7d7a99');
    p.round(0,4.50,.50,4.62,.12,.22,'#c3a5b6');
    p.sign(0,4.32,.476,2.69,.33,'客服走廊',pink,plum);
    for(const s of [-1,1])upright(p,s*2.36,0,4.02,.43,.63,'#807a99','#a28ca6',pink);
  });
}

// Extra chapter landmarks sit behind the walking plane or on the existing outer edge.
function wallClock(p,x,y,z,r,edge,face){
  // A many-sided bezel and clock hands are separate solid parts.
  p.round(x,y,z,r*2.18,r*2.18,.23,edge);
  p.round(x,y,z+.15,r*1.89,r*1.89,.11,face);
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;
    p.ball(x+Math.sin(a)*r*.75,y+Math.cos(a)*r*.75,z+.23,.044,.044,.025,edge);
  }
  p.round(x,y+r*.21,z+.246,.071,r*.48,.046,edge);
  p.round(x+r*.26,y,z+.25,r*.57,.069,.046,'#bb697d');
  p.ball(x,y,z+.29,.081,.08,.032,edge);
}
function monitor(p,x,y,z,body,screen,art=cyan){
  p.round(x,y,z,1.48,.91,.31,body);
  p.round(x,y+.025,z+.174,1.27,.71,.07,screen);
  for(let i=0;i<3;i++)p.round(x-.30+i*.28,y+.13-i*.13,z+.218,.46,.054,.028,art);
  p.round(x,y-.57,z,.15,.30,.19,body);
  p.round(x,y-.743,z+.015,.70,.09,.41,body);
}
function illuminatedShelf(p,w,y,z,body,light){
  p.round(0,y,z,w,.20,.86,body);
  p.round(0,y-.115,z+.23,w*.88,.048,.27,light);
}
function officeDepth(kind,kit){
 const {place}=kit;
 if(kind==='night'){
  place(0,-20.29,0,p=>{
    wallClock(p,0,6.03,.12,1.16,'#55445f','#ffe1a3');
    p.round(0,7.23,.08,4.08,.25,.94,'#635a7c');
    p.round(0,5.58,-.08,3.96,1.45,.68,'#66567f');
  });
  for(const s of [-1,1]){
   place(s*15.05,-14.63,-s*.49,p=>{
    p.round(0,.66,0,3.12,1.29,.93,'#797486');
    p.round(0,1.30,0,3.35,.14,1.14,'#c59c9c');
    monitor(p,-.76,2.09,.18,navy,'#374563','#d4b387');
    cactus(p,.9,1.40,.09,.87,teal,leaf,'#ae7992');
    p.round(-.2,1.43,.45,.72,.064,.39,soft);
   });
   place(s*18.55,5.34,-s*turn,p=>{upright(p,0,.08,3.27,.70,.76,'#6d769a','#617193');pendent(p,0,.84,2.72,plum,amber);});
  }
 }else if(kind==='lobby'){
  place(0,-21.13,0,p=>{
   p.round(0,6.01,0,13.68,.50,.81,'#8494a7');
   illuminatedShelf(p,13.29,5.75,.44,'#bdcfd0','#fff0bb');
   for(const x of [-4,-2,0,2,4]){
    p.round(x,5.02,.23,.72,.76,.22,'#d5d1b3');
    p.round(x,4.99,.37,.56,.58,.07,'#b1e1e1');
   }
  });
  for(const s of [-1,1]){
   place(s*19.14,-15.78,-s*.65,p=>{
    upright(p,0,0,6.43,.94,1.16,'#abc7ce','#dfdbc4','#fff1cc');
    p.round(s*.91,1.91,.46,.81,1.29,.47,'#587c91');
    p.sign(s*.91,1.95,.724,.60,.86,'入場',snow,navy);
    p.box(s*.91,1.39,.67,.32,.093,.22,'#cce3d9');
   });
   place(s*18.56,7.85,-s*turn,p=>{bench(p,4.25,'#b5cfd0','#d5dfcf');cactus(p,s*2.62,0,.16,1.51,teal,leaf,'#b29e86');});
  }
 }else if(kind==='pantry'){
  place(17.47,-11.35,-turn,p=>{
   p.round(0,.78,0,4.07,1.53,1.03,'#a98068');
   p.round(0,1.55,0,4.21,.21,1.17,'#e1ba8a');
   p.round(-.75,2.24,.03,1.62,1.20,.79,'#8a664e');
   p.round(-.75,2.45,.50,1.45,.72,.18,'#ddb383');
   p.round(-.75,2.18,.631,1.08,.26,.14,'#645247');
   for(const x of [-.97,-.52])p.cyl(x,1.82,.63,.17,.13,.27,soft,12);
   p.sign(1.08,2.02,.56,1.28,.40,'熱咖啡',soft,'#935d58');
  });
  place(-12.0,-19.11,0,p=>{
   p.round(0,4.78,.16,4.8,.66,.20,teal);
   p.sign(0,4.80,.283,4.58,.43,'茶水間　OPEN',soft,'#667c6b');
  });
  place(-18.5,6.85,turn,p=>{lowShelf(p,0,0,3.27,1.54,'#7fa9a0','#5c8f85',[soft,'#edbc8c','#cab9a6']);cactus(p,1.28,1.60,.16,.84,leaf,teal,'#9a7584');});
 }else if(kind==='board'){
  place(-8.4,-18.92,0,p=>{
   p.round(0,3.40,.08,7.13,3.64,.25,'#5a4f6f');
   p.round(0,3.40,.236,6.78,3.34,.10,'#d4d4ec');
   p.sign(0,4.31,.299,5.97,.45,'本週會議時數　↑',ink,'#cabbdc');
   for(let i=0;i<6;i++){
    const x=-2.34+i*.92,h=.35+[.1,.55,.33,1.04,1.24,1.42][i];
    p.round(x,2.43+h/2,.309,.45,h,.10,['#8c92c2','#9087bf','#ae7ea5'][i%3]);
   }
   p.box(0,2.43,.31,5.57,.08,.10,'#8a82ad');
  });
  place(8.55,-19.07,0,p=>{wallClock(p,0,4.10,.05,1.01,plum,'#eacfc2');illuminatedShelf(p,5.15,3.0,.18,mauve,'#efddba');});
  for(const s of [-1,1])
   place(s*18.38,3.12,-s*turn,p=>{bench(p,4.01,'#857991','#b19aaf');cactus(p,s*1.8,0,.86,.90,teal,leaf,'#9f7b91');});
 }else if(kind==='call'){
  place(8.03,-18.86,0,p=>{
   p.round(0,5.08,.08,6.54,.62,.31,'#705b84');
   p.sign(0,5.09,.268,6.12,.43,'客服部　｜　匿名留言板',soft,'#755984');
  });
  place(-8.12,-18.83,0,p=>{
   p.round(0,3.62,0,5.17,1.24,.37,'#577893');
   p.sign(0,3.60,.22,4.90,.99,'通話中   ● ● ●',soft,'#3c6f88');
   for(const x of [-2.39,2.39])p.ball(x,3.10,.25,.077,.076,.044,mint);
  });
  for(const s of [-1,1]){
   place(s*17.30,4.41,-s*turn,p=>{
    p.round(0,.70,0,3.55,1.28,.94,s>0?mauve:teal);
    p.round(0,1.33,.05,3.74,.19,1.13,s>0?pink:'#b0d8ce');
    monitor(p,-.85,2.12,.10,s>0?plum:navy,s>0?'#614b70':'#396e83');
    monitor(p,.85,2.12,.10,s>0?plum:navy,s>0?'#614b70':'#396e83');
   });
  }
 }
}
const compose=(base,kind)=>kit=>{base(kit);officeDepth(kind,kit);};
const office=(rows,palette,ground,backdrop)=>Object.freeze({rows:Object.freeze(rows),palette:Object.freeze(palette),ground,backdrop});
export const OFFICE_QUALITY=Object.freeze({
  '3-0':office([
    '####E####',
    '##......#',
    '##.###..#',
    '##...B.##',
    '#...S..##',
    '#......##',
    '##.##.###',
    '##....###',
    '#########',
  ],['#aca5ae','#d9c7bb','#44495e','#697088','#8d94a9','#ebc284'],'office',compose(nightShift,'night')),
  '3-1':office([
    '####E####',
    '#.......#',
    '#.#####.#',
    '#...B...#',
    '#...S...#',
    '##.....##',
    '##.###.##',
    '##.....##',
    '#########',
  ],['#c3d8d3','#ecede0','#627d8b','#8daeb6','#c1d5d1','#dcc093'],'marble',compose(towerLobby,'lobby')),
  '3-2':office([
    '####E####',
    '#......##',
    '#.####.##',
    '#..B....#',
    '##..S...#',
    '##......#',
    '###.##..#',
    '###.....#',
    '#########',
  ],['#bcc4a8','#e3d9b4','#638581','#8ea690','#b4c3a1','#efc992'],'office',compose(pantryFloor,'pantry')),
  '3-3':office([
    '####E####',
    '#......##',
    '#.####.##',
    '#..B...##',
    '##..S..##',
    '##.....##',
    '###.#..##',
    '###....##',
    '#########',
  ],['#a2a4bb','#d1cad1','#59576d','#776f8c','#a19eb5','#d7b1b7'],'carpet',compose(boardroom,'board')),
  '3-4':office([
    '####E####',
    '##......#',
    '##.####.#',
    '##...B..#',
    '##..S...#',
    '#.......#',
    '#.###.###',
    '#.....###',
    '#########',
  ],['#adbdc1','#d7d0cf','#5d7188','#849aa8','#a9a8be','#ebb6c6'],'office',compose(callFloor,'call')),
});
