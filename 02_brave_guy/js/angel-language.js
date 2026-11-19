import { lang } from './i18n.js?v=20261119dialogue';
const lines={
 '王之嘴炮':['Royal Barrage!','王の口撃！'],
 '笨蛋！':['Dummy!','バカ！'],
 '走開啦！':['Back off!','あっち行って！'],
 '給我閉嘴！':['Shut it!','黙りなさい！'],
 '不要過來！':['Stay back!','近寄らないで！'],
 '變態！不要過來':['Creep! Stay back!','変態！近寄らないで！'],
 '救命啊～色狼！':['Help! A pervert!','助けて～！変態！'],
 '給我站住！':['Stop right there!','待ちなさい！'],
 '全都給我過來！':['Get over here!','みんなこっちに来て！'],
 '嘴砲攻擊':['Verbal attack','言葉攻撃']
};
export function angelText(text){return lines[text]?.[lang==='en'?0:lang==='ja'?1:-1]||text;}
export const angelFont=()=>lang==='ja'?'"BG JP","BG Black",sans-serif':'"BG Black",sans-serif';
