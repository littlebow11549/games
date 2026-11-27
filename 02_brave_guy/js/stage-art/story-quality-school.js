// Hand-composed chapter one / wilderness environments. All props are real 3D.
const C={
 ink:0x402f46, deep:0x393652, stone:0x8b819d, slate:0x5b627c, white:0xffedde, cream:0xffdcaa,
 amber:0xffc276, lemon:0xffe899, gold:0xda9d53, red:0xc65b53, coral:0xee8275, pink:0xefadbd,
 oak:0xb3775b, wood:0x92574c, darkWood:0x613e48, tan:0xe2ae7d, teal:0x54928b, tealHi:0x8acac0,
 darkTeal:0x366c6c, navy:0x495783, blue:0x627aae, lilac:0xb9a0c2, violet:0x82658d,
 glass:0x8bc7dc, glassHi:0xd6eaf0, fern:0x759857, leaf:0x537851, leafy:0x60865e, pine:0x355b55,
 moss:0x476f57, grass:0x88a567, rose:0xcb797c, night:0x333951, bark:0x624d66, green:0xa4b575
};
const both=[-1,1];
const loop=(n,fn)=>{for(let i=0;i<n;i++)fn(i);};
const css=x=>'#'+x.toString(16).padStart(6,'0');
function label(p,x,y,z,w,h,t,a=C.ink,b=C.cream){p.sign(x,y,z,w,h,t,css(a),css(b));}
function rect(p,x,y,z,w,h,d,a,b){p.round(x,y,z,w,h,d,a);p.round(x,y,z+d*.51,w-.17,h-.15,.052,b);}
function frame(p,x,y,z,w,h,warm=false){
 rect(p,x,y,z,w+.25,h+.225,.205,C.darkWood,warm?C.amber:C.glass);
 p.round(x+.03,y+h*.287,z+.15,w-.09,.085,.026,warm?C.lemon:C.glassHi);
 p.box(x,y,z+.16,.056,h+.012,.055,C.wood);
 p.box(x,y+h*.035,z+.17,w+.064,.059,.036,C.wood);
 p.round(x,y-h*.514,z+.127,w+.34,.107,.24,C.tan);
}
function sill(p,x,y,z,w,d,color=C.tan){
 p.round(x,y-.055,z,w,.14,d,C.darkWood);
 p.round(x,y+.026,z,w-.045,.077,d-.05,color);
}
function books(p,x,y,z,n=4,s=1){
 loop(n,i=>{
  const h=(.36+(i%4)*.094)*s, w=(.155+(i%3)*.031)*s,col=[C.teal,C.lilac,C.red,C.amber,C.navy][i%5];
  p.round(x+i*.248*s,y+h/2,z,w,h,.262*s,col);
  p.box(x+i*.248*s,y+h*.82,z+.141*s,w*.71,.027*s,.022*s,C.cream);
 });
}
function pot(p,x,z,s=1,base=0){
 p.cyl(x,base+.172*s,z,.265*s,.194*s,.342*s,C.wood,10);
 p.cyl(x,base+.324*s,z,.286*s,.28*s,.084*s,C.coral,10);
 for(let i=0;i<5;i++){
  const a=i*Math.PI*.4;
  p.ball(x+Math.cos(a)*.177*s,base+(.48+i%2*.095)*s,z+Math.sin(a)*.148*s,.235*s,.208*s,.223*s,i%2?C.leaf:C.fern);
 }
 p.ball(x+.038*s,base+.698*s,z-.01*s,.183*s,.202*s,.180*s,C.grass);
}
function rail(p,w,x=0,y=.39,z=0,a=C.wood){
 p.round(x,y+.20,z,w,.117,.126,a);p.round(x,y-.10,z,w,.108,.133,C.darkWood);
 loop(Math.max(2,Math.floor(w/.8)),i=>{
  const n=Math.max(2,Math.floor(w/.8));const q=x-w/2+.098+(w-.196)*i/(n-1);
  p.round(q,y-.020,z,.135,.683,.141,a);p.round(q,y+.331,z,.169,.054,.166,C.tan);
 });
}
function bulb(p,x,y,z,h=.82){
 p.cyl(x,.082,z,.16,.19,.164,C.ink,8);
 p.cyl(x,(y-.17)/2,z,.037,.053,y-.17,C.wood,8);
 p.round(x,y,z,.48*h,.58*h,.45*h,C.darkWood);
 p.round(x,y,z+.218*h,.347*h,.376*h,.047,C.amber);
 p.round(x+.013,y+.069*h,z+.246*h,.262*h,.244*h,.025,C.lemon);
 p.round(x,y+.298*h,z,.593*h,.094*h,.535*h,C.wood);
 p.ball(x,y+.352*h,z,.088*h,.054*h,.088*h,C.amber);
}
function notice(p,x,y,z,w,h,txt){
 rect(p,x,y,z,w,h,.152,C.wood,C.cream);
 label(p,x,y+.109,z+.118,w*.78,h*.29,txt);
 for(const side of both){
  p.round(x+side*w*.231,y-h*.177,z+.122,w*.247,h*.244,.035,side>0?C.white:C.pink);
  p.round(x+side*w*.231,y-h*.12,z+.146,w*.182,.027,.014,C.tan);
 }
}
function bed(p,x,z,s=1,col=C.rose){
 const r=(u,y,v,w,h,d,colr)=>p.round(x+u*s,y*s,z+v*s,w*s,h*s,d*s,colr);
 for(const k of both)for(const j of both)r(.776*k,.296,.943*j,.17,.56,.17,C.darkWood);
 r(0,.504,0,1.97,.299,2.53,C.wood);r(0,.672,0,1.90,.22,2.43,C.white);
 r(0,.805,.305,1.95,.214,1.796,col);r(0,.923,.57,1.79,.041,.914,C.pink);
 for(let i=0;i<5;i++)r(-.69+i*.347,.949,.499,.052,.024,.905,C.white);
 r(0,.817,-.753,1.29,.193,.587,C.cream);r(0,.891,-.751,1.19,.100,.487,C.white);
 r(0,1.108,-1.148,1.954,.900,.201,C.wood);r(0,1.470,-1.143,2.062,.134,.243,C.tan);
}
function roomWall(p,w=5.3,H=4.08,col=C.pink){
 p.round(0,H/2,-.86,w,H,.39,col);
 p.round(0,H-.064,-.843,w+.11,.165,.506,C.darkWood);
 p.round(0,H+.030,-.841,w+.11,.071,.513,C.tan);
 p.round(0,.475,-.600,w,.28,.123,C.wood);
 for(const k of both)p.round(k*(w/2-.13),H/2,-.608,.224,H,.158,C.wood);
}
function dorm({place}){
 place(-10.58,-9.65,.075,p=>{
  roomWall(p,6.97,4.25,0xe3a5aa);
  frame(p,-1.48,2.95,-.60,2.49,1.62);
  for(const x of [-2.98,-.04])p.round(x,2.93,-.34,.42,1.83,.295,C.violet);
  sill(p,-1.49,2.044,-.378,2.722,.44,C.cream);
  bed(p,-.887,.38,1.27);
  p.round(1.62,.64,.17,1.06,1.10,1.01,C.wood);sill(p,1.62,1.24,.17,1.22,1.12);
  rect(p,1.62,.78,.68,.847,.35,.087,C.darkWood,C.tan);
  p.ball(1.62,.78,.767,.103,.061,.041,C.darkWood);
  p.round(1.63,1.508,.19,.65,.41,.29,C.red);
  label(p,1.63,1.51,.369,.55,.25,'05:00',C.ink,C.white);
  p.ball(1.50,1.734,.211,.105,.081,.092,C.coral);p.ball(1.77,1.734,.212,.105,.081,.093,C.coral);
  notice(p,1.76,2.76,-.621,2.21,1.12,'期中考');
  pot(p,2.68,.76,.82);
 });
 place(10.23,-9.85,-.08,p=>{
  roomWall(p,6.23,4.31,0xe2aa95);
  p.round(1.77,1.85,-.18,1.83,3.69,1.51,C.wood);
  p.round(1.77,3.754,-.18,1.99,.257,1.62,C.darkWood);
  for(const o of both){
   rect(p,1.77+o*.43,1.99,.594,.807,2.72,.105,C.darkWood,o<0?C.violet:C.navy);
   p.round(1.77+o*.1,1.74,.695,.063,.352,.054,C.amber);
  }
  p.round(-.94,.757,.371,3.02,1.33,1.47,C.wood);
  sill(p,-.94,1.44,.371,3.16,1.57,C.cream);
  p.round(-.67,.823,1.107,1.14,.61,.119,C.teal);
  p.round(-1.20,2.56,-.346,2.42,.16,.523,C.wood);
  books(p,-2.12,2.65,-.337,7,1.07);
  books(p,-1.48,1.527,.393,3,.93);
  p.cyl(-1.92,1.799,.201,.052,.081,.52,C.darkWood,8);
  p.ball(-1.87,2.072,.242,.282,.177,.260,C.amber);
 });
 place(-10.62,-14.17,.075,p=>{roomWall(p,7.15,4.32,0xc58e9f);for(const x of [-2.04,.83])frame(p,x,2.96,-.597,1.89,1.35);});
 place(10.61,-14.2,-.09,p=>{roomWall(p,6.9,4.49,0xc294aa);notice(p,-.42,2.82,-.601,2.5,1.2,'宿舍守則');});
 place(-14.0,-4.9,.3,p=>{roomWall(p,4.75,2.69);sill(p,0,.78,.31,4.43,1.12);books(p,-1.66,.84,.32,11);});
 place(14.1,-4.9,-.29,p=>{roomWall(p,4.7,2.72,0xd1a5b7);for(const x of [-1.53,0,1.53])rect(p,x,1.4,-.53,1.31,2.33,.147,C.wood,C.lilac);});
 place(-9.98,7.72,.26,p=>{rail(p,3.35,0,.344,0,C.wood);p.round(0,.056,-.46,3.28,.106,1.57,C.pink);pot(p,-1.35,-.19,.61);});
 place(9.85,8.52,-.24,p=>{p.round(0,.12,0,3.62,.202,1.68,C.wood);p.round(0,.233,0,3.50,.050,1.60,C.rose);pot(p,.94,-.073,.62);});
}
function basket(p,s=1){
 const r=(x,y,z,w,h,d,col)=>p.round(x*s,y*s,z*s,w*s,h*s,d*s,col);
 r(0,.123,0,1.314,.247,1.212,C.ink);
 p.cyl(0,1.62*s,0,.142*s,.226*s,3.06*s,C.navy,12);
 r(0,3.161,.361,.238,.244,.879,C.navy);
 rect(p,0,3.719*s,.33*s,2.49*s,1.40*s,.209*s,C.ink,C.white);
 rect(p,0,3.676*s,.496*s,.91*s,.56*s,.029*s,C.red,C.white);
 const z=.865*s,y=3.267*s;
 loop(18,i=>{const q=i*Math.PI/9;p.ball(Math.cos(q)*.387*s,y,z+Math.sin(q)*.387*s,.097*s,.052*s,.097*s,C.coral);});
 loop(8,i=>{const q=i*Math.PI/4;p.cyl(Math.cos(q)*.282*s,y-.22*s,z+Math.sin(q)*.282*s,.018*s,.021*s,.39*s,C.white,5);});
 loop(12,i=>{const q=i*Math.PI/6;p.ball(Math.cos(q)*.215*s,y-.425*s,z+Math.sin(q)*.215*s,.066*s,.04*s,.066*s,C.cream);});
}
function stands(p,y=0){
 loop(4,i=>{
  const h=.387+i*.362,z=.83-i*.737;
  p.round(0,y+h/2,z,6.052,h,.793,C.navy);
  p.round(0,y+h,z+.026,6.132,.117,.795,i%2?C.teal:C.darkTeal);
  p.round(0,y+h+.065,z+.045,6.043,.038,.768,C.tealHi);
  for(let q=0;q<4;q++)p.round((q-1.5)*1.384,y+h+.074,z+.125,1.21,.038,.056,C.cream);
 });
 for(const x of [-2.96,2.96])p.round(x,y+.46,.04,.236,.90,2.98,C.wood);
}
function court({place}){
 place(-8.54,-8.76,.19,p=>basket(p,.83));
 place(8.54,-8.76,-.19,p=>basket(p,.83));
 for(const x of [-10.53,10.53])place(x,-12.17,0,p=>{
  stands(p);rail(p,6.02,0,1.77,-1.56,C.wood);
  p.round(0,.13,-1.92,6.4,.260,.48,C.navy);
  p.round(0,.389,-1.93,6.52,.31,.475,C.darkTeal);
  p.round(0,.55,-1.93,6.57,.065,.52,C.tealHi);
 });
 place(-9.44,-15.31,.02,p=>{
  p.round(0,1.98,0,4.21,2.72,1.39,C.ink);p.round(0,2.035,.71,4.08,2.59,.156,C.navy);
  label(p,0,2.36,.811,3.26,.54,'校際籃球賽',C.cream,C.darkTeal);
  label(p,0,1.71,.816,2.94,.48,'24　：　08',C.gold,C.night);
 });
 place(9.45,-15.36,.0,p=>{
  p.round(0,.748,.0,4.16,1.49,1.17,C.wood);sill(p,0,1.55,.0,4.20,1.28,C.tan);
  rect(p,0,.857,.604,3.16,.667,.112,C.night,C.cream);label(p,0,.861,.701,2.31,.40,'過路費');
  for(let i=0;i<4;i++)p.cyl(-.74+i*.35,1.69,.246,.13,.133,.094,C.gold,12);
 });
 for(const x of [-12.2,12.2])place(x,8.93,x>0?-.9:.9,p=>{
  rail(p,3.47,0,.29,0,C.darkTeal);
  p.ball(1.2,.31,.409,.31,.31,.31,C.amber);
  p.cyl(1.2,.319,.41,.306,.306,.055,C.wood,13);pot(p,-1.42,.16,.64);
 });
}
function columns(p,w=5.4,h=3.8){
 for(const x of [-w*.42,w*.42]){
  p.round(x,.224,-.4,.68,.448,.73,C.ink);
  p.round(x,h*.49,-.4,.49,h*.73,.54,C.darkTeal);
  p.round(x,h*.501,-.103,.268,h*.73,.087,C.teal);
  p.round(x,h*.869,-.404,.657,.251,.703,C.ink);
 }
}
function discipline({place}){
 place(-10.42,-9.35,.12,p=>{
  p.round(0,.19,-.20,6.64,.378,3.57,C.ink);
  sill(p,0,.46,-.20,6.58,3.54,C.stone);
  for(let i=0;i<4;i++)p.round(0,.13+i*.079,1.60-i*.341,3.17-i*.06,.253+i*.165,.413,i%2?C.white:C.stone);
  columns(p,6.2,4.18);
  p.round(0,3.55,-.43,6.34,.574,1.39,C.deep);
  p.round(0,3.858,-.45,6.49,.216,1.51,C.navy);
  p.round(0,4.00,-.472,6.34,.112,1.425,C.lilac);
  label(p,0,3.56,.301,2.17,.428,'司令台',C.cream,C.navy);
  p.round(0,1.075,-.119,1.53,1.28,.97,C.wood);sill(p,0,1.784,-.12,1.61,1.03,C.amber);
  rect(p,0,1.24,.389,1.00,.488,.10,C.ink,C.navy);
  p.ball(0,1.26,.504,.168,.164,.031,C.amber);
  p.cyl(.29,1.99,-.12,.043,.062,.383,C.ink,8);
  p.ball(.301,2.18,-.09,.11,.084,.084,C.stone);
 });
 place(10.26,-9.72,-.1,p=>{
  roomWall(p,6.27,4.05,0xe0b28d);
  frame(p,1.48,2.79,-.607,2.62,1.43, false);
  label(p,-1.46,3.58,-.510,1.94,.43,'教官室',C.cream,C.darkTeal);
  p.round(-2.01,1.58,-.158,1.19,3.08,1.07,C.navy);
  for(let i=0;i<5;i++)rect(p,-2.01,.53+i*.465,.404,1.02,.36,.115,C.ink,i%2?C.slate:C.blue);
  p.round(.353,.829,.59,2.54,1.25,1.20,C.wood);sill(p,.353,1.53,.59,2.59,1.26);
  label(p,.352,1.022,1.243,1.67,.32,'訓導勤務',C.ink,C.white);
  books(p,-.418,1.59,.482,3,1.0);
  pot(p,2.29,.94,.79);
 });
 place(-10.49,-13.95,.11,p=>{roomWall(p,6.46,4.28,0xbe9ba0);notice(p,1.26,2.65,-.635,2.52,1.21,'立正・稍息');});
 place(10.49,-14.03,-.09,p=>{roomWall(p,6.28,4.57,0xd2a389);frame(p,-.88,2.95,-.604,2.73,1.40);});
 for(const x of [-17.88,17.88])place(x,-.21,x>0?-.8:.8,p=>{
  p.cyl(0,.26,0,.324,.395,.52,C.wood,10);p.cyl(0,2.42,0,.046,.051,4.45,C.ink,8);
  p.ball(0,4.681,0,.105,.095,.11,C.amber);
  p.round(.9,3.893,0,1.86,.881,.106,x>0?C.red:C.navy);p.ball(.93,3.889,.067,.153,.151,.038,C.white);
 });
 for(const x of [-9.63,9.63])place(x,8.82,x>0?-.1:.1,p=>{rail(p,3.39,0,.25,0,C.wood);pot(p,-1.70,.10,.51);});
}
function rockbed(p,x,z,s=1,plant=false){
 const forms=[[-.43,.33,.15,.65,.34,.54,C.stone],[.44,.28,.01,.57,.28,.42,C.slate],[-.03,.59,-.21,.66,.58,.63,0x9094a1],[.79,.16,.34,.32,.16,.28,C.stone]];
 for(const [u,y,v,a,b,c,color] of forms)p.ball(x+u*s,y*s,z+v*s,a*s,b*s,c*s,color);
 if(plant)for(let i=0;i<5;i++)p.ball(x+(i-2)*.20*s,.20*s,z+.58*s,.25*s,.192*s,.22*s,i%2?C.moss:C.fern);
}
function floatingNote(p,x,y,z,t,s=1,red=false){
 p.round(x,y,z,.681*s,.571*s,.060*s,red?C.red:C.ink);
 p.round(x,y,z+.044*s,.627*s,.523*s,.057*s,red?C.coral:C.cream);
 if(t)label(p,x,y,z+.093*s,.595*s,.292*s,t,red?C.red:C.ink,red?C.amber:C.white);
 else for(let i=0;i<3;i++)p.round(x-.027*s,y+(.106-i*.111)*s,z+.093*s,(.416-i*.056)*s,.035*s,.020*s,red?C.red:C.tan);
}
function campusGate(p){
 for(const x of [-2.62,2.62]){
  p.round(x,.233,0,1.45,.465,1.37,C.deep);
  p.round(x,.458,0,1.30,.149,1.26,C.lilac);
  p.round(x,2.12,0,1.133,3.20,1.14,C.ink);
  p.round(x,2.145,.042,1.04,3.19,1.12,0xc996a0);
  p.round(x-.18,2.01,.616,.48,2.93,.077,0xdda8ae);
  p.round(x,3.711,.004,1.517,.282,1.45,C.darkWood);
  p.round(x,3.896,.02,1.59,.193,1.59,C.violet);
  p.round(x,4.011,.021,1.448,.096,1.49,C.lilac);
  for(const sign of [-1,1])p.round(x+sign*.238,2.03,.655,.074,.63,.077,C.red);
  const del=x>0?1:-1;
  // Art-only gate leaves folded back flush with the posts; opening is genuinely empty.
  for(let i=0;i<5;i++)p.round(x+del*.205,1.41,-.51-i*.276,.065,2.14,.061,C.deep);
  for(const y of [.526,1.63,2.497])p.round(x+del*.205,y,-1.045,.107,.121,1.355,C.violet);
 }
 p.round(0,3.631,.026,5.46,.483,.758,C.deep);
 p.round(0,3.753,.051,5.43,.297,.793,C.violet);
 p.round(0,3.944,.070,5.56,.112,.835,C.lilac);
 label(p,0,3.667,.476,2.16,.367,'校門口',C.ink,C.cream);
}
function gate({place}){
 place(-10.61,-6.61,.07,p=>campusGate(p));
 place(9.9,-9.93,-.07,p=>{
  p.round(.69,.91,-.40,3.34,1.78,1.87,C.deep);
  p.round(.68,1.06,.58,3.26,1.59,.213,0xa286a2);
  frame(p,1.11,1.188,.697,1.46,.82,true);
  p.round(.70,1.960,-.37,3.60,.317,2.03,C.ink);
  p.round(.72,2.181,-.42,3.35,.229,1.93,C.violet);
  p.round(.76,2.335,-.48,3.13,.115,1.79,C.lilac);
  bulb(p,-1.75,1.85,.21);
  floatingNote(p,-1.30,2.94,.625,'忍一下',.85);floatingNote(p,-.11,2.57,.725,'算了',.71);
  floatingNote(p,1.8,2.986,.411,'沒關係',.79);floatingNote(p,2.55,2.397,.94,null,.63);
 });
 for(const x of [-9.98,9.98])place(x,-14.45,x>0?-.12:.12,p=>{
  roomWall(p,6.54,3.8,0x9d84a6);sill(p,0,1.10,-.47,6.5,.78,C.lilac);
  for(const i of [-2,-1,0,1,2])p.round(i*1.16,2.14,-.53,.105,1.73,.089,C.darkWood);
  for(const k of both)floatingNote(p,k*1.94,2.93+k*.21,.014,null,.87);
 });
 for(const x of [-14.46,14.46])place(x,-4.68,x>0?-.56:.56,p=>{bulb(p,0,2.14,-.27);floatingNote(p,.59,2.75,.09,'別說',.72);});
 for(const x of [-14.18,14.18])place(x,8.66,x>0?-.06:.06,p=>{p.round(0,.25,0,3.94,.496,1.67,C.deep);p.round(0,.522,0,3.88,.101,1.61,C.lilac);floatingNote(p,-.65,.76,.377,null,.49);floatingNote(p,.7,.75,.400,null,.46);});
}
function woodtree(p,x,z,s=1,t=0){
 const shades=t%2?[0x315755,0x3c6a5d,0x508167,0x78a076]:[0x344f56,0x466568,0x597c71,0x789b80];
 const r=(u,y,v,a,b,c,col)=>p.ball(x+u*s,y*s,z+v*s,a*s,b*s,c*s,col);
 p.cyl(x,1.18*s,z,.151*s,.32*s,2.35*s,C.bark,9);
 p.round(x+.09*s,1.562*s,z+.121*s,.179*s,1.74*s,.18*s,0x7c6669);
 r(-.275,.253,.093,.45,.219,.292,C.wood);r(.243,.196,.057,.43,.177,.268,C.wood);
 r(-.147,2.525,.001,1.18,.695,.757,shades[0]);
 r(.407,2.575,.09,.92,.64,.759,shades[0]);
 r(-.769,2.814,-.050,.697,.571,.585,shades[1]);
 r(.703,2.881,-.053,.711,.589,.599,shades[1]);
 r(-.48,3.17,.047,.795,.529,.625,shades[2]);
 r(.44,3.449,.027,.705,.552,.588,shades[2]);
 r(0,3.679,-.058,.729,.669,.602,shades[2]);
 r(.013,4.001,-.089,.495,.423,.458,shades[3]);
 r(-.486,3.418,.196,.433,.279,.417,shades[3]);
}
function mushrooms(p,x,z,s){
 for(const [u,v,k,color] of [[0,0,1.0,0xd5abca],[.356,.424,.62,0x94b7a3],[-.343,.207,.76,0xba9cb8],[-.599,.052,.49,0xceadb8]]){
  const t=s*k;
  p.cyl(x+u*s,.153*t,z+v*s,.074*t,.119*t,.31*t,0xb7b7b7,8);
  p.ball(x+u*s,.338*t,z+v*s,.253*t,.138*t,.218*t,color);
  p.ball(x+(u+.055)*s,.443*t,z+(v+.045)*s,.09*t,.036*t,.08*t,C.cream);
 }
}
function forest({place}){
 place(-10.47,-9.51,.11,p=>{
  woodtree(p,-2.06,-.66,1.14);woodtree(p,-.03,-1,1.34,1);woodtree(p,1.81,-.62,1.05);
  rockbed(p,-.5,.45,.70,true);mushrooms(p,1.56,.718,1.2);mushrooms(p,-2.51,.732,1.05);
 });
 place(10.19,-9.65,-.08,p=>{
  woodtree(p,1.04,-.69,1.31,1);woodtree(p,2.73,-.25,.92);
  rockbed(p,1.84,.556,.78,true);mushrooms(p,.14,.96,.79);
  p.cyl(-1.35,1.18,.752,.114,.186,2.31,C.wood,8);
  label(p,-1.54,2.12,.901,2.15,.50,'← 同學都',C.ink,C.cream);
  label(p,-1.17,1.637,.913,2.23,.44,'大家都 →',C.ink,C.cream);
  label(p,-1.47,1.18,.928,1.96,.39,'← 跟過來',C.ink,C.white);
  for(const [x,y,z] of [[-2.83,1.77,.377],[-.65,2.87,.71],[-.06,2.12,.449],[1.013,1.29,.71]])p.ball(x,y,z,.072,.069,.071,C.amber);
 });
 for(const x of [-10.69,10.69])place(x,-14.13,x>0?-.16:.16,p=>{
  woodtree(p,-2.08,-.416,.98,1);woodtree(p,.06,-1.251,1.40);woodtree(p,2.30,-.50,1.04,1);rockbed(p,.44,.92,.85,true);
 });
 for(const x of [-14.05,14.05])place(x,.102,x>0?-.77:.77,p=>{
  woodtree(p,-.82,-.43,1.09,1);woodtree(p,1.27,-.61,.93);rockbed(p,.16,.81,.75,true);
 });
 for(const x of [-10.08,10.08])place(x,8.92,x>0?-.18:.18,p=>{rockbed(p,-.69,-.26,1.17,true);mushrooms(p,1.12,.507,1.15);});
}
function villageHouse(p,x,z,s=1,style=0){
 const r=(u,y,v,w,h,d,col)=>p.round(x+u*s,y*s,z+v*s,w*s,h*s,d*s,col);
 const wall=[0xc68f79,0xbd8c95,0xe2ad99][style%3],roof=[0x504563,0x595777,0x705173][style%3];
 r(0,.124,0,3.51,.248,2.77,C.deep);
 r(0,1.259,-.026,3.21,2.05,2.49,wall);
 r(0,.437,1.203,3.23,.297,.141,C.darkWood);
 for(const u of [-1.46,1.46])r(u,1.316,1.207,.157,1.96,.186,C.wood);
 r(0,2.224,-.014,3.77,.238,2.78,C.deep);
 r(0,2.401,-.075,3.65,.164,2.66,roof);
 r(0,2.540,-.193,3.43,.164,2.41,roof);
 r(0,2.681,-.323,3.13,.173,2.21,roof);
 r(0,2.833,-.440,2.84,.172,1.98,roof);
 r(0,2.998,-.535,2.52,.151,1.72,roof);
 r(0,3.106,-.637,2.13,.129,1.49,C.violet);
 for(let i=0;i<10;i++)r(-1.56+i*.348,2.28,1.382,.051,.08,.098,C.violet);
 r(.99,2.943,-.573,.33,.711,.443,C.wood);
 r(.989,3.321,-.574,.443,.118,.515,C.darkWood);
 if(style===1){
  frame(p,x-.772*s,1.375*s,z+1.281*s,1.12*s,.82*s,true);
  frame(p,x+.755*s,1.375*s,z+1.281*s,1.12*s,.82*s,true);
  r(0,1.982,1.264,1.76,.249,.161,C.wood);r(0,2.119,1.278,1.89,.064,.178,C.amber);
 }else{
  r(-.762,1.032,1.264,.954,1.556,.189,C.ink);
  r(-.762,1.051,1.375,.81,1.435,.109,C.darkTeal);
  r(-.655,.984,1.445,.09,.08,.062,C.amber);
  r(-.761,.223,1.439,1.277,.168,.6,C.stone);
  frame(p,x+.657*s,1.47*s,z+1.285*s,1.20*s,1.02*s,true);
 }
}
function well(p){
 const x=-.19,z=.37;
 p.cyl(x,.23,z,1.16,1.27,.46,C.deep,16);
 p.cyl(x,.589,z,1.04,1.15,.60,C.slate,16);
 p.cyl(x,.928,z,1.137,1.056,.198,0xa39aaf,16);
 p.cyl(x,1.03,z,.934,.921,.034,C.ink,18);
 p.cyl(x,1.055,z,.746,.747,.030,0x659caa,20);
 p.cyl(x-.155,1.076,z+.119,.248,.254,.021,C.glass,11);
 for(const a of both)p.round(x+a*.896,1.77,z-.36,.131,1.54,.151,C.wood);
 p.round(x,2.524,z-.34,2.168,.193,.720,C.darkWood);
 p.round(x,2.652,z-.43,2.29,.143,.833,C.violet);
 p.cyl(x,1.904,z-.182,.024,.024,1.07,C.cream,7);
 p.cyl(x,1.418,z-.173,.108,.163,.208,C.amber,8);
}
function village({place}){
 place(-10.92,-9.77,.07,p=>{
  villageHouse(p,-1.61,-.38,1.04);villageHouse(p,1.93,-.53,.83,1);
  bulb(p,2.90,1.84,1.043);floatingNote(p,.49,2.67,1.53,null,.65,true);
  for(const [x,y,z] of [[.29,2.96,1.53],[.84,2.77,1.71],[.59,3.168,1.645]])p.ball(x,y,z,.066,.057,.064,C.amber);
 });
 place(9.63,-9.63,-.11,p=>{
  villageHouse(p,1.91,-.54,1.03,2);well(p);bulb(p,-2.142,1.85,.734);
  label(p,-1.745,1.73,.875,1.34,.39,'村落水井',C.ink,C.cream);
  floatingNote(p,-.97,2.65,1.15,null,.53,true);
 });
 for(const x of [-10.91,10.91])place(x,-14.58,x>0?-.06:.06,p=>{
  villageHouse(p,-1.82,0,.96,styleFrom(x));villageHouse(p,1.832,-.18,1.03,1);bulb(p,-.148,1.91,.953);
 });
 for(const x of [-14.2,14.2])place(x,-4.82,x>0?-.6:.6,p=>{villageHouse(p,-.45,-.47,.82,2);bulb(p,1.34,1.74,.73);});
 for(const x of [-14.06,14.06])place(x,8.91,x>0?-.18:.18,p=>{rail(p,3.74,0,.29,0,C.darkWood);rockbed(p,.08,.341,.53);floatingNote(p,.47,.95,.463,null,.42,true);});
}
function styleFrom(x){return x>0?2:0;}
function carvedSill(p,w,z,accent,stone=C.stone){
 p.round(0,.12,z,w,.24,.78,C.ink);
 p.round(0,.272,z,w+.04,.16,.82,stone);
 p.round(0,.369,z+.018,w-.08,.06,.76,accent);
}
function dormTrim({place}){
 for(const s of both){
  place(s*12.63,-1.45,s<0?Math.PI/2:-Math.PI/2,p=>{
   carvedSill(p,5.81,.08,C.tan,C.wood);
   p.round(0,1.095,-.211,5.77,1.44,.54,0xb37f87);
   p.round(0,1.832,-.185,5.86,.134,.65,C.tan);
   for(let i=0;i<5;i++){
    const x=(i-2)*1.105;
    rect(p,x,1.095,.091,.91,1.03,.103,C.wood,i%2?0xc89191:0xd69e99);
   }
   p.round(-1.66,1.929,-.15,1.51,.054,.48,C.cream);books(p,-2.16,1.97,-.12,4,.78);
   pot(p,1.91,-.11,.78,1.91);
  });
  place(s*8.44,6.3,s<0?.16:-.16,p=>{
   carvedSill(p,1.89,.07,C.cream,C.oak);
   p.round(0,.448,.075,1.57,.158,.60,s>0?C.teal:C.rose);
   p.round(0,.55,.084,1.48,.072,.51,s>0?C.tealHi:C.pink);
   p.round(s*.41,.622,.068,.621,.106,.45,C.white);
   p.round(s*.41,.685,.072,.563,.068,.47,C.lilac);
  });
 }
 place(-10.51,-6.72,.03,p=>{
  p.round(0,.173,0,4.98,.32,.91,C.darkWood);
  p.round(0,.34,0,4.91,.063,.87,C.tan);
  for(const x of [-.42,.18,.74]){
   p.round(x,.45,.17,.30,.16,.58,0xbd817a);
   p.round(x,.562,.027,.265,.115,.25,C.pink);
  }
 });
}
function courtTrim({place}){
 for(const s of both){
  place(s*12.50,-3.32,s<0?Math.PI/2:-Math.PI/2,p=>{
   carvedSill(p,5.05,.04,C.tealHi,C.darkTeal);
   p.round(0,.466,.04,4.98,.13,.75,C.teal);
   for(let i=0;i<6;i++)p.round((i-2.5)*.791,.519,.041,.56,.047,.62,0x649f93);
   rail(p,5.0,0,.43,-.36,C.darkTeal);
  });
  place(s*10.11,10.07,s>0?-.27:.27,p=>{
   carvedSill(p,2.93,.08,C.tan,C.navy);
   p.round(0,.52,.08,2.74,.24,.84,C.teal);
   p.round(0,.67,.10,2.79,.085,.85,C.tealHi);
   p.ball(-s*.91,.925,.12,.26,.25,.26,C.amber);
   p.cyl(-s*.91,.929,.12,.261,.261,.047,C.red,12);
  });
 }
}
function standTrim({place}){
 for(const s of both){
  place(s*9.14,4.58,s>0?-Math.PI/2:Math.PI/2,p=>{
   carvedSill(p,4.11,.06,C.tan,0xaa8d88);
   p.round(0,.492,.059,3.97,.251,.728,C.slate);
   p.round(0,.657,.069,3.95,.082,.741,C.stone);
   for(const x of [-1.75,.05,1.75]){
    p.round(x,.529,.442,.105,.29,.066,0xbca6a0);
    p.round(x,.707,.03,.30,.085,.79,C.tan);
   }
   pot(p,s*1.27,.066,.49,.731);
  });
 }
 place(-11.74,-8.06,.12,p=>{
  p.round(0,.217,0,2.12,.433,.63,C.wood);
  p.round(0,.512,0,2.11,.19,.64,C.navy);
  p.round(0,.637,.048,2.09,.06,.641,C.lilac);
  label(p,0,.51,.363,1.48,.168,'列隊區',C.cream,C.navy);
 });
}
function gateTrim({place}){
 for(const s of both){
  place(s*8.31,-2.72,s>0?-Math.PI/2:Math.PI/2,p=>{
   carvedSill(p,4.93,.05,C.lilac,C.deep);
   p.round(0,.595,.00,4.69,.426,.52,0x997894);
   p.round(0,.837,.03,4.74,.097,.645,C.lilac);
   for(const x of [-2.28,0,2.27]){
    p.round(x,.631,.05,.237,.66,.74,0xb190a6);
    p.round(x,.98,.05,.304,.145,.79,C.violet);
   }
   floatingNote(p,s*.86,1.384,.03,null,.60);
  });
  place(s*8.24,4.5,s>0?-.23:.23,p=>{
   carvedSill(p,1.72,0,C.lilac,C.deep);
   p.round(0,.503,.021,.89,.256,.51,C.violet);
   p.round(0,.684,.045,.71,.142,.42,C.amber);
   p.round(0,.793,.017,.69,.093,.45,C.darkWood);
  });
 }
}
function forestTrim({place}){
 for(const s of both){
  place(s*9.38,-3.45,s>0?-.24:.24,p=>{
   woodtree(p,s*.72,-.19,.85,s>0?1:0);
   rockbed(p,-s*.22,.56,.57,true);
   mushrooms(p,-s*.79,.73,.75);
  });
  place(s*8.79,4.89,s>0?-.39:.39,p=>{
   rockbed(p,s*.32,-.12,1.07,true);
   mushrooms(p,-s*.64,.461,.89);
   for(let i=0;i<4;i++)p.ball(s*(.37+i*.243),.27+(i%2)*.07,.48,.35,.208,.29,i%2?C.fern:C.moss);
  });
  place(s*8.94,2.0,s>0?-.25:.25,p=>{
   p.cyl(-s*.11,.296,-.108,.39,.53,.59,C.bark,9);
   p.cyl(-s*.11,.612,-.109,.341,.364,.066,0xb28f91,9);
   p.cyl(-s*.12,.651,-.107,.231,.231,.015,0x876f7b,9);
   for(const x of [-.46,.12])mushrooms(p,s*x,.77,.50);
  });
 }
}
function villageTrim({place}){
 for(const s of both){
  place(s*8.29,.08,s>0?-Math.PI/2:Math.PI/2,p=>{
   carvedSill(p,3.95,.07,0xbe9c9a,C.deep);
   p.round(0,.545,.081,3.79,.343,.59,0x938394);
   p.round(0,.753,.09,3.92,.089,.696,0xb2a0a4);
   for(let i=0;i<3;i++)p.round((i-1)*1.79,.559,.095,.179,.53,.68,C.stone);
   p.round(-.87,.854,.09,.48,.093,.435,C.wood);
   p.round(-.87,.963,.13,.39,.209,.33,C.amber);
   p.round(-.87,1.094,.087,.398,.074,.341,C.darkWood);
  });
  place(s*11.25,-4.56,s>0?-.19:.18,p=>{
   villageHouse(p,s*.30,-.39,.77,s>0?2:1);
   p.cyl(-s*.96,.274,.758,.23,.184,.53,C.oak,8);
   p.cyl(-s*.96,.516,.758,.25,.246,.066,C.wood,8);
   floatingNote(p,s*.23,1.48,.946,null,.61,true);
  });
  place(s*14.22,6.82,s>0?-.28:.28,p=>{
   rockbed(p,s*.31,.026,.55);
   p.cyl(-s*.34,.267,-.28,.302,.235,.524,C.wood,12);
   p.cyl(-s*.34,.461,-.28,.311,.288,.058,C.tan,12);
   p.cyl(-s*.34,.55,-.28,.302,.28,.063,C.oak,12);
  });
 }
}

const make=(rows,palette,ground,backdrop)=>Object.freeze({rows:Object.freeze(rows),palette:Object.freeze(palette),ground,backdrop});
export const SCHOOL_QUALITY=Object.freeze({
 '1-0':make([
  '####E####','###...###','###...###','###.B.###','##..S..##','###...###','###...###','####.####','#########',
 ],['#dcc095','#fbe0b9','#7c526a','#a6747c','#db9b94','#b98272'],'wood',kit=>{dorm(kit);dormTrim(kit);}),
 '1-2':make([
  '####E####','###...###','###...###','##..B..##','##..S..##','##.....##','###...###','##.....##','#########',
 ],['#dc9d5f','#f8ce88','#2e6564','#517f72','#80aa82','#fff0c0'],'court',kit=>{court(kit);courtTrim(kit);}),
 '1-3':make([
  '####E####','###...###','###...###','###.B.###','#...S...#','#.#...#.#','#.#...#.#','#.......#','#########',
 ],['#ba9c88','#e5bda0','#625268','#977681','#c49993','#f0d9a5'],'stone',kit=>{discipline(kit);standTrim(kit);}),
 '1-4':make([
  '####E####','####.####','###...###','###.B.###','###.S.###','###...###','##.....##','##.#.#.##','#########',
 ],['#a495b8','#caafca','#54446a','#795985','#ba89a2','#e6bcc7'],'stone',kit=>{gate(kit);gateTrim(kit);}),
 '2-1':make([
  '####E####','###..####','###...###','###.B.###','###.S.###','###...###','###...###','##..#..##','#########',
 ],['#638773','#a5b192','#243f45','#3f675a','#6b8d73','#98c3a5'],'moss',kit=>{forest(kit);forestTrim(kit);}),
 '2-2':make([
  '####E####','####..###','###...###','###.B.###','###.S.###','##.....##','##.....##','###...###','#########',
 ],['#8b7082','#b99b95','#3c395b','#645676','#9b7390','#ddb388'],'stone',kit=>{village(kit);villageTrim(kit);}),
});
