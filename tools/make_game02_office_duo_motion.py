"""Bake the 3-2 office bosses from their non-humanoid Tripo rigs."""
import argparse
import math
import zipfile
from pathlib import Path

import numpy as np
from scipy.spatial.transform import Rotation

from make_game02_incubus_motion import bake

COMMON={'Idle':1.35,'Run':.64,'Spawn':.64,'Hit':.23,'Fall':.9}
ROLES={
    'newbie_chick': ('新雞', '19_xinji', {'Snapshot':.8,'Charge':1.5},
        {'Run':('追擊・碎步',[0,.22,.48,.72]),'Snapshot':('模仿攻擊・0.50 秒出手',[0,.31,.625,.92]),
         'Charge':('蓄力與衝刺',[0,.32,.61,.84]),'Fall':('落敗',[0,.26,.57,1])}),
    'gossip_snake': ('八卦蛇', '20_baguashe', {'Whisper':.6,'Spread':.72},
        {'Run':('貼地蛇行',[0,.22,.49,.73]),'Whisper':('咬耳朵・即時加速隊友',[0,.30,.54,.90]),
         'Spread':('扇射・0.50 秒出手',[0,.33,.694,.94]),'Fall':('落敗',[0,.25,.55,1])}),
}


def animate(chick):
    def factory(loc, names, pose):
        expected={'Body','Neck','Head','Tail','L_Wing','L_WingTip','L_Leg','L_Foot','R_Wing','R_WingTip','R_Leg','R_Foot'} if chick else {'Coil','Spine_1','Spine_2','Spine_3','Spine_4','Head'}
        assert set(names)==expected
        base='Body' if chick else 'Coil'
        floor=float(pose(loc)[:,1].min())

        def motion(name,t):
            m=loc.copy()
            def rot(b,a,v):
                i=names[b]
                m[i,:3,:3]=m[i,:3,:3]@Rotation.from_euler(a,v,degrees=True).as_matrix()
            def shift(x=0,y=0,z=0):
                m[names[base],:3,3]+=[x,y,z]
            def ease(a,b):
                v=max(0,min(1,(t-a)/(b-a)))
                return v*v*(3-2*v)
            def hump(a,b,c):
                return ease(a,b)*(1-ease(b,c))
            s=math.sin(math.tau*t)
            if chick:
                if name=='Idle':
                    rot('Neck','x',3*s); rot('Head','z',2.6*s); rot('Tail','x',8*s)
                elif name=='Run':
                    rot('Body','x',9); rot('Body','z',3.3*s); shift(y=.026*s*s)
                    rot('Head','x',-5+5*s); rot('Tail','x',14*s)
                    for side,sign in [('L',1),('R',-1)]:
                        p=sign*s
                        rot(side+'_Leg','x',26*p); rot(side+'_Foot','x',-17*max(0,p))
                        rot(side+'_Wing','x',-13*p); rot(side+'_WingTip','z',sign*11*abs(s))
                elif name=='Snapshot':
                    sneak=hump(.02,.36,.61); out=hump(.38,.625,.97)
                    rot('Body','y',-13*sneak+14*out); rot('Neck','x',10*sneak-13*out)
                    rot('Head','z',-12*sneak+8*out); rot('R_Wing','x',25*sneak-44*out)
                    rot('R_Wing','z',-12*sneak-17*out); rot('R_WingTip','x',-27*out)
                    rot('L_Wing','z',15*out); rot('Tail','x',-14*sneak)
                    shift(y=-.018*sneak+.02*out)
                elif name=='Charge':
                    prep=hump(0,.39,.52); dash=ease(.45,.55)*(1-ease(.91,1))
                    rot('Body','x',-8*prep+20*dash);rot('Head','x',-14*dash+11*prep)
                    rot('Tail','x',-22*dash)
                    stride=math.sin(math.tau*6*t)*dash
                    for side,sign in [('L',1),('R',-1)]:
                        rot(side+'_Wing','x',27*dash);rot(side+'_Wing','z',sign*(24*dash+10*prep))
                        rot(side+'_Leg','x',28*sign*stride)
                    shift(y=.025*abs(stride)-.027*prep)
                elif name=='Spawn':
                    u=hump(0,.47,1)
                    rot('Head','z',9*u);rot('R_Wing','z',-26*u);rot('L_Wing','z',26*u)
                    rot('R_WingTip','x',-32*u);shift(y=.075*u)
                elif name=='Hit':
                    u=hump(0,.24,1)
                    rot('Body','x',-12*u);rot('Head','z',12*u);shift(z=-.04*u)
                elif name=='Fall':
                    u=ease(.1,1)
                    rot('Body','z',-68*u);rot('Head','x',-17*u)
                    rot('R_Wing','z',-24*u);rot('L_Leg','x',19*u)
                    shift(x=.15*u,y=-.18*u)
            else:
                sp=[f'Spine_{i}' for i in range(1,5)]
                if name=='Idle':
                    for i,b in enumerate(sp):rot(b,'z',2.5*math.sin(math.tau*t-i*.62))
                    rot('Head','y',4*s)
                elif name=='Run':
                    for i,b in enumerate(sp):
                        a=math.sin(math.tau*t-i*.76)
                        rot(b,'z',6.5*a);rot(b,'y',7*a);rot(b,'x',3+2.6*a)
                    rot('Head','z',-6*s);shift(x=.023*s)
                elif name=='Whisper':
                    a=hump(0,.27,.96);b=hump(.32,.53,1)
                    for i,j in enumerate(sp):
                        rot(j,'y',(9 if i%2==0 else -4)*a)
                        rot(j,'z',(6+i*1.3)*a-(5 if i<2 else 0)*b)
                    rot('Head','y',-17*a+14*b);rot('Head','x',12*b);rot('Head','z',-13*a)
                elif name=='Spread':
                    a=hump(0,.37,.69); b=hump(.39,.694,1)
                    for i,j in enumerate(sp):rot(j,'x',-7*a+(6+i*3)*b)
                    rot('Head','y',-12*a+17*b);rot('Head','x',-12*b)
                    shift(z=.044*b)
                elif name=='Spawn':
                    u=hump(0,.49,1)
                    for i,j in enumerate(sp):rot(j,'x',(-10+i*2)*u);rot(j,'z',4*u)
                    rot('Head','y',-12*u);shift(z=-.035*u)
                elif name=='Hit':
                    u=hump(0,.22,1)
                    for i,j in enumerate(sp):rot(j,'x',(-4-i*3)*u)
                    rot('Head','y',13*u);shift(z=-.04*u)
                elif name=='Fall':
                    u=ease(.07,1)
                    for i,j in enumerate(sp):rot(j,'z',(14+i*1.8)*u);rot(j,'x',(5-i*7)*u)
                    rot('Head','x',-16*u);shift(x=-.16*u,y=-.043*u)
            low=float(pose(m)[:,1].min())
            if low<floor:shift(y=floor-low)
            return m
        return motion
    return factory


if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--rig-zip',required=True,type=Path)
    p.add_argument('--output',required=True,type=Path)
    args=p.parse_args()
    args.output.mkdir(exist_ok=True,parents=True)
    with zipfile.ZipFile(args.rig_zip) as z:
        for kind,(title,key,moves,frames) in ROLES.items():
            profile=(COMMON|moves,title+'｜3-2 雙守關者','3D 模型分格｜原有招式時間不變',
                     f'brave_guy_charactor{key}_motion.glb',animate(kind=='newbie_chick'),frames)
            bake(kind,z.read(f'GLB/{kind}_rig.glb'),args.output,motion_profile=profile)
