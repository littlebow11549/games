import {mountLandmarks} from './solid-landmarks.js?v=20261127landmarks';

const C={ink:0x49364f,deep:0x333143,paper:0xffedca,wood:0xc18974,leaf:0x91b6a1,
 mint:0x87cbc2,rose:0xd692a7,amber:0xffcd7d,blue:0x7fa8c8,glass:0xb8dce3,violet:0xa78bb9,slate:0x6c677e};
const {ink,deep,paper,wood,leaf,mint,rose,amber,blue,glass,violet,slate}=C;
const tw=[-1,1];
function mat(p,w=3.75,d=2.05,col=slate){
 p.round(0,.09,0,w,.18,d,deep);
 p.round(0,.21,-.015,w-.12,.13,d-.12,col);
 for(const x of tw)p.round(x*(w/2-.28),.283,.13,.055,.018,d*.61,paper);
}
function post(p,x,z,h,col=wood){
 p.round(x,.36,z,.28,.23,.28,ink);
 p.round(x,.30+(h-.3)/2,z,.17,h-.3,.18,col);
 p.ball(x,h,z,.118,.108,.117,paper);
}
function trim(p,x,y,z,w,h,col=wood,inside=paper){
 p.round(x,y,z,w,h,.21,ink);
 p.round(x,y,z+.10,w-.15,h-.15,.11,col);
 p.round(x,y,z+.163,w-.27,h-.26,.047,inside);
}
function line(p,x,y,z,w,col=paper){p.round(x,y,z,w,.053,.029,col);}
function pages(p,x,y,z,w,h,cover=rose){
 p.round(x,y,z,w,h,.047,cover);
 p.round(x+.037,y-.015,z+.043,w*.80,h*.82,.041,paper);
 for(let i=0;i<3;i++)line(p,x+.04,y+h*.21-i*.13,z+.074,w*(i===2?.44:.59),ink);
}
function book(p,x,y,z,w,col){
 p.round(x,y,z,w,.16,.38,col);
 p.round(x+.026,y,z+.195,w-.11,.099,.021,paper);
}
function plant(p,x,z,s=1){
 p.cyl(x,.275+.23*s,z,.27*s,.22*s,.46*s,wood,12);
 p.cyl(x,.275+.45*s,z,.283*s,.266*s,.073*s,rose,12);
 for(const [u,v,i] of [[-.19,.03,0],[.17,.05,1],[.02,-.11,0],[.04,.13,1]]){
  p.ball(x+u*s,.275+(.60+i*.105)*s,z+v*s,.15*s,.27*s,.135*s,i?mint:leaf);
 }
}
function badge(p,x,y,z,r,col=amber){
 p.ball(x,y,z,r,r,.065,deep);p.ball(x,y,z+.055,r*.77,r*.77,.047,col);
 p.ball(x-r*.22,y+r*.24,z+.094,r*.23,r*.27,.02,paper);
}
function bench(p,x,z,w,col=wood){
 for(const k of tw)p.round(x+k*w*.32,.49,z,.19,.48,.53,ink);
 p.round(x,.757,z,w,.15,.64,col);
 for(const k of tw)line(p,x,.839,z+k*.17,w-.14,paper);
}
function boxes(p,x,z,s,col){
 for(const [u,y,v,w,h,d] of [[-.34,.24,.15,.67,.43,.59],[.37,.30,-.10,.70,.53,.60],[.30,.69,-.11,.57,.28,.51]]){
  p.round(x+u*s,.275+y*s,z+v*s,w*s,h*s,d*s,col);
  p.round(x+(u-.06)*s,.275+y*s,z+(v+d/2)*s,.096*s,h*.96*s,.044*s,paper);
  p.round(x+(u+.15)*s,.275+(y-.07)*s,z+(v+d/2+.03)*s,.19*s,.099*s,.024*s,amber);
 }
}
function dormBoard(p){
 mat(p,3.69,2.03,rose);
 for(const x of [-1.27,1.27])post(p,x,-.34,2.72);
 trim(p,0,1.91,-.24,2.82,1.41,wood,0xe5b884);
 p.round(0,2.69,-.29,2.96,.19,.73,rose);
 for(const [x,y,h,col] of [[-.84,1.93,.84,rose],[.03,1.83,.74,blue],[.84,1.98,.87,leaf]])pages(p,x,y,-.038,.59,h,col);
 bench(p,-.35,.47,1.94);plant(p,1.39,.54,.79);
}
function parcels(p){
 mat(p,3.69,2.13,0xb6929d);
 p.round(-.15,1.09,-.27,2.75,1.60,1.23,wood);
 p.round(-.15,1.08,.351,2.56,1.35,.092,ink);
 for(const y of [.58,1.13,1.72])p.round(-.15,y,.46,2.62,.095,.28,wood);
 for(const x of [-1.39,-.55,.30,1.14])p.round(x,1.10,.45,.083,1.30,.28,wood);
 for(const [x,y,z,col] of [[-.99,.82,.51,rose],[-.13,.83,.50,leaf],[.70,.84,.51,0xe9b588],[-.99,1.42,.49,leaf],[.70,1.43,.49,rose]]){
  p.round(x,y,z,.56,.41,.39,col);
  p.round(x,y,z+.202,.12,.36,.023,paper);
 }
 p.round(-.15,2.00,-.27,2.95,.28,1.32,rose);badge(p,-.15,2,.461,.17);
 boxes(p,1.16,.68,.62,0xc88a79);
}
function scoreboard(p){
 mat(p,3.90,2.15,0xb99475);
 for(const x of [-1.34,1.34])post(p,x,-.18,2.65,mint);
 trim(p,0,1.94,-.08,3.05,1.36,blue,deep);
 const z=.096;
 for(const x of [-.75,.75]){
  p.round(x,1.92,z,.86,.91,.065,ink);
  for(const dy of [-.26,0,.26])line(p,x,1.92+dy,z+.045,.40,amber);
  for(const sx of tw)p.round(x+sx*.22,1.91,z+.045,.058,.62,.04,amber);
 }
 for(const y of [1.8,2.04])p.ball(0,y,z+.055,.066,.066,.029,paper);
 p.round(0,2.71,-.08,2.83,.13,.46,mint);
 bench(p,.11,.62,2.25,wood);p.ball(1.45,.57,.59,.30,.30,.30,0xf5aa6b);
}
function equipment(p){
 mat(p,3.70,2.25,0x93af9b);
 p.round(-.32,.97,-.33,2.29,1.36,1.22,ink);
 for(const y of [.47,1.00,1.57])p.round(-.32,y,-.21,2.49,.12,1.38,mint);
 for(const x of [-1.43,.79])p.round(x,1.01,.43,.13,1.21,.16,blue);
 for(const [i,x] of [-1.03,-.40,.24].entries()){
   p.ball(x,1.26,.46,.25,.25,.25,i===1?paper:0xe89c62);
   p.ball(x-.062,1.32,.68,.076,.075,.034,i===1?slate:wood);
 }
 for(const x of [-.89,-.34,.21])p.round(x,.68,.51,.46,.30,.46,blue);
 for(const [x,z] of [[1.19,.44],[1.49,-.37],[.63,.67]]) {
   p.cyl(x,.32,z,.23,.23,.072,paper);p.cone(x,.55,z,.204,.44,0xe6a05e,12);
 }
}
function podium(p){
 mat(p,3.52,2.20,0xb88980);
 p.round(0,.39,-.11,2.71,.23,1.55,wood);
 p.round(-.51,1.07,.06,.95,1.28,.76,wood);
 p.round(-.51,1.14,.451,.69,.88,.098,0xd1a181);
 p.round(-.51,1.77,.04,1.16,.18,.94,ink);
 badge(p,-.51,1.28,.516,.17,amber);
 p.round(-.28,1.91,.23,.046,.19,.048,deep);p.ball(-.28,2.04,.29,.077,.066,.108,deep);
 for(const z of [-.66,-.27,.12])p.round(.86,.54,z,.73,.17,.19,paper);
 post(p,.96,-.46,2.78,wood);
 p.round(.62,2.38,-.45,.68,.57,.065,rose);
 line(p,.62,2.36,-.399,.46,paper);
 plant(p,1.24,.63,.70);
}
function trophy(p){
 mat(p,3.67,1.98,0xb99c93);
 trim(p,-.18,1.49,-.17,2.92,2.20,wood,0x594a65);
 for(const y of [.58,1.38,2.17])p.round(-.18,y,.28,2.73,.105,.97,wood);
 for(const [i,x] of [-.94,-.18,.56].entries()){
  p.cyl(x,.725,.48,.225,.239,.17,ink);
  p.cyl(x,.88,.48,.083,.12,.18,amber);
  p.cyl(x,1.095,.48,.24,.112,.27,i===1?paper:amber);
  for(const k of tw)p.ball(x+k*.207,1.11,.49,.107,.105,.052,amber);
  p.ball(x,1.24,.48,.125,.09,.10,paper);
  book(p,x,1.51,.48,.58,i===1?blue:rose);
 }
 badge(p,-.18,2.29,.06,.18);plant(p,1.33,.52,.60);
}
function booth(p){
 mat(p,3.82,2.46,0x9c81aa);
 p.round(-.33,1.24,-.19,2.52,1.98,1.62,0x9c81a9);
 p.round(-.33,2.28,-.20,2.84,.23,1.97,ink);
 p.round(-.33,2.45,-.29,2.69,.18,1.71,violet);
 p.round(-.33,2.58,-.39,2.44,.15,1.38,rose);
 trim(p,-.71,1.47,.645,1.22,.85,wood,amber);
 p.round(-.71,1.49,.824,.058,.65,.039,wood);
 p.round(.33,.99,.659,.61,1.42,.17,ink);
 p.round(.33,.98,.756,.46,1.26,.08,blue);
 p.round(.33,1.27,.808,.25,.37,.036,glass);
 badge(p,-.33,2.19,.85,.189);
 post(p,1.29,.46,1.04,ink);p.round(.84,1.01,.53,.90,.11,.13,amber);
 for(const x of [.51,.82,1.13])p.round(x,1.01,.613,.119,.12,.035,paper);
}
function bikeShelter(p){
 mat(p,3.82,2.32,0xa993b2);
 for(const x of [-1.57,1.57])for(const z of [-.84,.68])post(p,x,z,z>0?2.24:2.54,violet);
 for(let i=0;i<4;i++)p.round(0,2.30+i*.085,.68-i*.42,3.50,.169,.56,i%2?blue:violet);
 for(const [i,z] of [-.52,.24].entries()){
  const cx=i?.18:-.24;
  for(const s of tw){
   p.ball(cx+s*.58,.63,z,.34,.34,.079,deep);
   p.ball(cx+s*.58,.63,z+.055,.246,.246,.046,i?rose:mint);
   p.ball(cx+s*.58,.63,z+.099,.114,.114,.035,deep);
  }
  p.round(cx,.89,z+.05,.82,.12,.091,i?rose:mint);
  p.round(cx-.25,1.01,z+.05,.071,.29,.074,ink);
  p.round(cx+.47,1.06,z+.05,.078,.39,.087,ink);
  p.round(cx-.23,1.16,z+.05,.30,.089,.12,wood);
 }
}
function desk(p){
 mat(p,3.83,2.32,0x837ba1);
 for(const x of [-1.13,1.13])p.round(x,.68,-.04,.24,.83,.99,ink);
 p.round(0,1.18,-.05,2.70,.176,1.21,wood);
 p.round(-.64,1.36,-.21,.52,.13,.38,slate);
 p.round(-.64,1.56,-.30,.12,.33,.14,ink);
 trim(p,-.64,1.87,-.26,1.29,.80,blue,0x658eb0);
 for(const [i,y] of [1.71,1.87,2.00].entries())line(p,-.67,y,-.071,.72-i*.11,glass);
 p.round(-.63,1.29,.27,.91,.058,.28,ink);
 for(const [i,x] of [-.92,-.73,-.54,-.35].entries())p.round(x,1.329,.27,.105,.026,.129,i===0?amber:blue);
 book(p,.67,1.38,.35,.74,rose);book(p,.68,1.52,.33,.57,paper);
 p.round(.91,1.62,-.46,.12,.80,.13,ink);p.ball(.76,2.00,-.38,.31,.14,.26,amber);
}
function punchin(p){
 mat(p,3.51,2.21,0x827b9d);
 p.round(-.56,1.31,-.26,1.48,2.08,.93,blue);
 p.round(-.56,1.24,.224,1.23,1.59,.105,deep);
 badge(p,-.56,1.87,.305,.39,paper);
 p.round(-.56,1.92,.429,.062,.18,.034,deep);
 line(p,-.49,1.84,.426,.19,deep);
 p.round(-.56,1.34,.348,.75,.13,.089,wood);
 p.round(-.56,1.18,.434,.46,.23,.093,paper);
 for(const y of [1.05,1.20])line(p,-.55,y,.49,.25,ink);
 p.round(.72,1.03,-.23,.86,1.52,.84,wood);
 for(let j=0;j<5;j++)p.round(.72,.58+j*.24,.254,.66,.105,.142,j%2?paper:amber);
 plant(p,1.28,.61,.63);
}
function directory(p){
 mat(p,3.81,2.15,0x8db0ac);
 for(const x of [-1.24,1.24])post(p,x,-.31,2.51,mint);
 trim(p,0,1.68,-.19,2.71,1.68,blue,0x476876);
 for(let j=0;j<4;j++){
  const y=1.18+j*.33;
  p.round(-.89,y,.005,.23,.17,.063,j===3?amber:mint);
  line(p,-.196,y,.027,1.04-j*.08,glass);
  p.round(.77,y,.016,.32,.083,.058,paper);
 }
 bench(p,0,.62,1.71,mint);plant(p,1.40,.56,.70);
}
function reception(p){
 mat(p,3.74,2.31,0xa4b9ab);
 p.round(0,.88,.09,2.83,1.22,1.47,blue);
 p.round(0,.93,.849,2.59,.85,.145,glass);
 for(const x of [-.82,0,.82])p.round(x,.92,.929,.63,.057,.043,mint);
 p.round(0,1.55,.052,3.02,.155,1.60,paper);
 p.cyl(.76,1.69,.61,.24,.27,.12,slate);
 p.ball(.76,1.78,.60,.18,.125,.18,amber);
 trim(p,-.65,1.94,-.29,1.08,.63,blue,deep);
 for(const y of [1.83,1.97])line(p,-.69,y,-.115,.62,glass);
 plant(p,-1.40,.80,.55);book(p,.23,1.72,.39,.56,mint);
}
function coffee(p){
 mat(p,3.89,2.46,0x99ae89);
 p.round(0,.77,-.16,2.95,1.03,1.45,0xa79d87);
 for(const x of [-.94,0,.94]){
  p.round(x,.75,.574,.82,.78,.112,leaf);line(p,x,.91,.641,.30,paper);
 }
 p.round(0,1.34,-.12,3.06,.153,1.64,paper);
 p.round(-.41,1.87,-.31,1.29,1.01,1.02,mint);
 p.round(-.41,1.74,.218,1.05,.52,.096,deep);
 p.round(-.41,2.19,.251,.96,.212,.09,blue);
 for(const x of [-.64,-.35,-.10])p.ball(x,2.18,.318,.05,.05,.03,amber);
 for(const x of [-.65,-.21]){
  p.cyl(x,1.53,.40,.128,.098,.22,paper);
  p.ball(x+.14,1.55,.40,.068,.069,.055,rose);
 }
 for(const [i,x] of [.51,.84,1.14].entries()){
  p.cyl(x,1.63,.19,.135,.116,.44,i===1?amber:rose);
  p.cyl(x,1.87,.19,.145,.145,.067,paper);
 }
}
function waterStation(p){
 mat(p,3.51,2.26,0xaab59a);
 p.round(-.70,.83,-.25,1.08,1.12,1.03,glass);
 p.round(-.70,1.50,-.25,1.20,.42,1.09,blue);
 p.ball(-.70,2.10,-.27,.47,.53,.45,mint);
 p.cyl(-.70,2.28,-.27,.37,.41,.34,glass);
 p.cyl(-.70,1.78,-.27,.35,.35,.13,slate);
 for(const x of [-.91,-.51])p.round(x,1.59,.333,.145,.156,.134,x<-.7?rose:mint);
 p.round(.59,.84,-.07,1.10,1.11,1.04,wood);
 book(p,.58,1.52,.34,.93,mint);
 for(const x of [.26,.59,.9])p.cyl(x,1.70,.33,.123,.100,.26,x===.59?rose:paper);
 plant(p,1.32,-.52,.71);
}
function projection(p){
 mat(p,3.94,2.32,0x8084a1);
 for(const x of [-1.46,1.46])post(p,x,-.29,2.69,blue);
 trim(p,0,1.99,-.17,3.08,1.45,slate,0x52648b);
 for(let i=0;i<5;i++){
  line(p,-.63,2.34-i*.166,.023,1.32-i*.113,glass);
  p.round(.30+i*.20,1.67+i*.062,.031,.119,.20+i*.123,.045,i===4?amber:mint);
 }
 p.round(.47,.78,.57,1.39,.13,.67,blue);
 p.round(.48,1.02,.55,.97,.34,.50,ink);
 p.ball(.75,1.03,.813,.12,.11,.062,glass);
}
function chairStack(p){
 mat(p,3.72,2.44,0x9088a8);
 p.round(-.52,.74,-.21,1.54,.95,.96,deep);
 for(let i=0;i<4;i++){
  const y=.49+i*.44,z=.15-i*.120;
  p.round(-.54,y,z,1.42,.18,.76,i%2?blue:violet);
  for(const x of [-1.11,.03])p.round(x,y+.23,z-.34,.083,.42,.09,ink);
  p.round(-.54,y+.47,z-.37,1.29,.28,.131,i%2?mint:blue);
 }
 p.round(.88,.91,.02,1.08,1.25,.97,wood);
 p.round(.88,1.57,.02,1.17,.16,1.01,rose);
 book(p,.88,1.72,.22,.80,paper);plant(p,1.10,-.62,.66);
}
function headset(p){
 mat(p,3.78,2.36,0xb294ad);
 p.round(-.49,.79,-.16,1.54,1.02,1.04,ink);
 p.round(-.49,1.36,-.16,1.96,.18,1.18,glass);
 trim(p,-.61,1.96,-.37,1.40,.85,violet,deep);
 for(const y of [1.80,1.97,2.11])line(p,-.57,y,-.18,.76,mint);
 p.ball(.76,1.49,.028,.58,.64,.19,ink);
 p.ball(.76,1.42,.124,.43,.43,.145,rose);
 p.ball(.76,1.41,.255,.34,.34,.083,0x655474);
 for(const x of [.32,1.20])p.round(x,1.35,.154,.231,.55,.24,blue);
 p.round(1.12,1.05,.33,.36,.080,.094,deep);p.ball(.96,1.06,.379,.062,.071,.065,amber);
 book(p,-.45,1.51,.31,.67,paper);
}
function ticketRail(p){
 mat(p,3.63,2.31,0xb399b4);
 for(const x of [-1.38,1.38])post(p,x,-.34,2.68,violet);
 trim(p,0,1.78,-.30,2.83,1.38,blue,deep);
 for(let i=0;i<4;i++){
  p.round(-.93+i*.62,1.86,-.109,.45,.53,.051,i<2?rose:mint);
  for(const dy of [-.09,.08])line(p,-.93+i*.62,1.86+dy,-.073,.24,paper);
 }
 for(const x of [-1.29,1.15])post(p,x,.63,.98,ink);
 for(let i=0;i<5;i++)p.ball(-1.05+i*.49,.83+.12*Math.abs(i-2),.61,.28,.067,.070,rose);
 p.round(.24,.51,-.16,1.12,.42,.81,wood);
 p.round(.24,.77,-.16,1.17,.12,.87,paper);
}
function ledgers(p){
 mat(p,3.85,2.39,0xc2997f);
 p.round(-.13,.97,-.29,2.78,1.42,1.42,wood);
 p.round(-.13,1.76,-.27,2.92,.18,1.51,paper);
 for(const x of [-1.02,-.12,.79]){
  p.round(x,1.01,.453,.79,.91,.147,0xd5a480);line(p,x,1.13,.541,.31,ink);
 }
 for(const [i,x] of [-.99,-.29,.46].entries()){
  for(let j=0;j<(i===1?4:2);j++)book(p,x,1.91+j*.156,j%2?.26:.13,.69-j*.056,[leaf,rose,blue,paper][(i+j)%4]);
 }
 p.round(1.03,1.98,-.35,.54,.23,.64,ink);
 for(let i=0;i<6;i++)p.round(.91+(i%3)*.12,2.105,-.43+Math.floor(i/3)*.18,.076,.02,.078,mint);
}
function vault(p){
 mat(p,3.70,2.30,0x929f9a);
 p.round(-.31,1.23,-.21,2.22,1.98,1.42,slate);
 trim(p,-.31,1.31,.521,1.86,1.54,blue,0x76879b);
 badge(p,-.30,1.33,.711,.33,amber);
 for(const x of [-.51,.0])p.round(x,1.33,.829,.22,.073,.037,ink);
 for(const y of [.89,1.71])p.round(-1.24,y,.673,.19,.21,.15,deep);
 p.round(.99,.54,.25,.71,.54,.65,wood);
 for(const [x,y] of [[.88,.88],[1.12,.89],[.96,.98]])p.cyl(x,y,.29,.096,.096,.114,amber);
}
function dispatch(p){
 mat(p,3.93,2.29,0x8c83aa);
 for(const x of [-1.39,1.39])post(p,x,-.42,2.58,violet);
 trim(p,0,1.84,-.29,2.91,1.29,slate,0x646687);
 for(const [i,x] of [-.91,0,.91].entries()){
  pages(p,x,1.83,-.089,.59,.72,[mint,amber,rose][i]);
  p.ball(x,2.31,-.063,.085,.076,.048,amber);
 }
 p.round(0,.82,.30,2.51,.18,.89,wood);
 for(const x of [-1.07,1.07])p.round(x,.51,.3,.16,.49,.37,ink);
 p.round(-.4,1.00,.505,.90,.15,.49,blue);p.round(.58,1.00,.505,.68,.15,.49,mint);
}
function barrier(p){
 mat(p,3.83,2.43,0x9a8ea8);
 for(const x of [-1.25,1.28])post(p,x,.43,1.63,slate);
 p.round(0,1.13,.437,2.91,.50,.24,ink);
 for(let i=0;i<8;i++)p.round(-1.22+i*.35,1.13,.575,.26,.31,.041,i%2?amber:rose);
 for(const x of [-1.25,1.28])p.ball(x,1.70,.44,.159,.173,.135,amber);
 p.round(-.54,1.31,-.49,.94,2.07,.71,blue);
 p.round(-.54,1.68,-.123,.70,.50,.090,deep);
 for(const y of [1.54,1.69,1.83])line(p,-.54,y,-.066,.48,glass);
 boxes(p,.69,-.36,.75,0xb092b4);
}
function lounge(p){
 mat(p,3.86,2.51,0x9c728f);
 p.round(0,.68,-.37,2.98,.63,1.22,ink);
 p.round(0,1.21,-.74,2.92,.87,.54,rose);
 for(const x of [-.87,0,.87])p.round(x,.94,-.22,.87,.30,.82,0xd4a0ab);
 for(const x of [-1.38,1.38])p.round(x,1.01,-.19,.36,.52,1.22,violet);
 p.round(-.72,1.32,-.53,.43,.36,.18,amber);
 p.round(.82,1.32,-.53,.43,.36,.18,paper);
 p.round(.29,.44,.57,1.65,.34,.83,ink);
 p.round(.29,.67,.57,1.80,.12,.90,wood);
 book(p,.11,.81,.67,.59,paper);p.ball(.66,.843,.51,.13,.13,.13,amber);
}
function timepiece(p){
 mat(p,3.63,2.30,0x997b95);
 p.round(-.35,.40,-.19,1.88,.26,1.32,ink);
 p.round(-.35,1.44,-.19,1.47,1.99,1.04,wood);
 p.round(-.35,2.46,-.19,1.72,.21,1.31,deep);
 badge(p,-.35,2.01,.364,.53,0xffdca3);
 line(p,-.24,1.96,.493,.29,ink);
 p.round(-.35,2.117,.493,.057,.31,.032,ink);
 trim(p,-.35,1.11,.364,.88,.75,ink,0x776285);
 p.round(-.35,1.18,.574,.054,.43,.047,amber);
 p.ball(-.35,.96,.599,.165,.16,.064,amber);
 plant(p,1.06,.40,1.04);
}
function riftShard(p,x,z,s,col){
 p.cyl(x,.275+.23*s,z,.65*s,.74*s,.46*s,deep,8);
 p.cyl(x,.275+.48*s,z,.59*s,.67*s,.18*s,violet,8);
 p.cyl(x,.275+1.02*s,z,.33*s,.35*s,.93*s,col,6);
 p.cone(x,.275+1.68*s,z,.331*s,.43*s,col,6);
 p.round(x-.11*s,.275+1.13*s,z+.318*s,.074*s,.60*s,.052*s,paper);
}
function prism(p){
 mat(p,3.80,2.29,0xa276a9);
 riftShard(p,-.27,-.22,1.58,0xe291c6);
 riftShard(p,1.03,.25,.80,0x978ed5);riftShard(p,-1.32,.45,.57,glass);
 for(const [x,z] of [[.47,.73],[1.27,-.65],[-1.19,-.73]])p.ball(x,.39,z,.20,.14,.18,violet);
}
function moonGate(p){
 mat(p,3.92,2.51,0x886d9f);
 for(const x of [-1.23,1.23]){
  p.round(x,.48,-.31,.90,.39,1.00,deep);
  p.round(x,1.40,-.32,.65,1.58,.68,violet);
  p.round(x,1.54,.037,.21,.91,.085,rose);
  p.ball(x,2.27,-.30,.413,.337,.39,blue);
 }
 p.round(0,2.54,-.30,3.24,.39,.77,ink);
 p.round(0,2.78,-.32,2.82,.19,.70,violet);
 badge(p,0,2.60,.13,.39,paper);
 p.ball(.13,2.66,.233,.23,.27,.075,violet);
 for(const x of [-.69,.69])p.cyl(x,2.957,-.30,.021,.15,.39,rose,6);
 for(const x of [-1.45,1.43])riftShard(p,x,.63,.45,glass);
}

const scenes={
 '1-0':[['Dorm | Morning noticeboard',dormBoard],['Dorm | Parcel cubbies',parcels]],
 '1-2':[['Court | Scoreboard',scoreboard],['Court | Equipment station',equipment]],
 '1-3':[['Campus | Announcement podium',podium],['Campus | Trophy shelf',trophy]],
 '1-4':[['Gate | Guard booth',booth],['Gate | Bicycle shelter',bikeShelter]],
 '3-0':[['Overtime | Night desk',desk],['Overtime | Punch card station',punchin]],
 '3-1':[['Lobby | Floor directory',directory],['Lobby | Reception counter',reception]],
 '3-2':[['Pantry | Coffee counter',coffee],['Pantry | Water station',waterStation]],
 '3-3':[['Meeting | Projector screen',projection],['Meeting | Stackable chairs',chairStack]],
 '3-4':[['Support | Headset desk',headset],['Support | Ticket queue',ticketRail]],
 '3-6':[['Finance | Ledger counter',ledgers],['Finance | Coin vault',vault]],
 '3-7':[['Cross-team | Dispatch board',dispatch],['Cross-team | Warning checkpoint',barrier]],
 '3-5':[['Penthouse | Sunset lounge',lounge],['Penthouse | Heirloom clock',timepiece]],
 '4-1':[['Nightmare | Fractured prism',prism],['Nightmare | Crescent arch',moonGate]]
};
export function makeChapterLandmarks(T,root,maze,camera,hero,id){
 const scene=scenes[id];
 if(!scene)throw new Error('Missing chapter landmark recipe '+id);
 const specs=scene.map(([name,draw],i)=>{
   const side=i?1:-1,x=side*8.75,z=i?-5.1:-2.0;
   const candidates=[];
   for(const dz of [0,1.6,-1.6,3.2,-3.2,4.8,-4.8,6.4,-6.4]){
    for(const xx of [7.2,8.75,10.25,11.85,13.25,14.8,16.3,17.7]){
     const pos={x:side*xx,z:z+dz};
     const reach=Math.min(...maze.walkCells.map(q=>Math.hypot(q.x-pos.x,q.z-pos.z)));
     if(reach>6.2)continue;
     candidates.push([pos.x-x,dz,Math.abs(dz)*1.0+Math.abs(xx-8.75)*.74]);
    }
   }
   candidates.sort((a,b)=>a[2]-b[2]);
   return {name,draw,x,z,yaw:i?-.20:.20,candidates};
 });
 return mountLandmarks(T,root,maze,camera,hero,ink,specs);
}
