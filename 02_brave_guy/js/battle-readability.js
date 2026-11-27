// Dense waves keep target/health information, not a red stripe over every enemy.
export const revealMobHealth=(population,locked,hp,maxHp)=>population<9||locked||hp<maxHp;
