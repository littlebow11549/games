"""Bake dedicated office boss movements from the archived Tripo suits."""
import argparse
import math
import zipfile
from pathlib import Path

import numpy as np
from scipy.spatial.transform import Rotation

from make_game02_incubus_motion import bake

COMMON={'Idle':1.55,'Run':.76,'Spawn':.45,'Fall':.8}
VARIANTS={
 'qian_manager':('錢經理','09',{'Fan':1,'Charge':1.5,'Summon':.52},{
 'Fan':('扇擊・0.60 秒出招',[0,.26,.60,.82]),'Charge':('蓄力 → 突進',[0,.37,.59,.87]),
 'Summon':('招呼部下・即時召喚',[0,.24,.55,.82]),'Fall':('落敗',[0,.29,.62,1])}),
 'lan_manager':('藍經理','10',{'Meeting':.52,'Whistle':1,'Spread':.72,'Heal':2.2},{
 'Meeting':('召開會議・指向場地',[0,.21,.54,.91]),'Whistle':('舉手吹哨・1.00 秒判定',[0,.27,.62,1]),
 'Spread':('扇射・0.50 秒出招',[0,.31,.69,.92]),'Heal':('會後再討論・2.20 秒回血',[0,.31,.61,.94])})
}

def animate(qian):
    def factory(loc,names,pose):
        floor=pose(loc)[:,1].min()
        def motion(name,t):
            m=loc.copy()
            def r(b,axis,angle):
                if b not in names:return
                i=names[b];m[i,:3,:3]=m[i,:3,:3]@Rotation.from_euler(axis,angle,degrees=True).as_matrix()
            def shift(y=0,z=0):
                m[names['Hips'],1:3,3]+=[y,z]
            def ease(a,b):
                u=np.clip((t-a)/(b-a),0,1);return u*u*(3-2*u)
            def hump(a,b,c):return ease(a,b)*(1-ease(b,c))
            s=math.sin(math.tau*t)
            r('Ponytail','x',4*s);r('Ponytail','z',3*s)
            if name=='Idle':
                r('Head','y',2*s);r('Spine','z',1.1*s);r('Chest','x',1.8*s);r('Neck','z',1.1*s)
            elif name=='Run':
                shift(.018*s*s);r('Spine','x',9 if qian else 7);r('Chest','y',5*s)
                for side,sgn in [('L',1),('R',-1)]:
                    p=sgn*s
                    r(side+'_Arm','x',-19*p);r(side+'_Forearm','x',-11+8*p)
                    r(side+'_Thigh','x',21*p);r(side+'_Shin','x',18*max(0,-p));r(side+'_Foot','x',-8*p)
                r('Ponytail','x',-13)
            elif name=='Spawn':
                a=hump(0,.52,1);r('Chest','x',-10*a);r('Head','z',(-9 if qian else 5)*a)
                r('R_Arm','x',-25*a);r('R_Forearm','x',-26*a);r('L_Arm','z',13*a)
            elif name=='Fan':
                prep=hump(0,.31,.60);go=hump(.29,.60,.99)
                r('Chest','y',-22*prep+25*go);r('Head','y',13*prep-10*go);r('Spine','x',10*go)
                r('R_Arm','x',-25*prep-49*go);r('R_Arm','z',-23*prep-10*go)
                r('R_Forearm','x',-41*prep-12*go);r('R_Hand','y',22*prep-23*go)
                r('L_Arm','z',13*go);r('Ponytail','y',16*prep-19*go)
                shift(-.016*prep,.025*go)
            elif name=='Charge':
                prep=hump(0,.35,.53);go=ease(.42,.56)*(1-ease(.92,1))
                step=math.sin(math.tau*5*t)*go
                r('Spine','x',-7*prep+22*go);r('Head','x',8*prep-10*go)
                r('Ponytail','x',-31*go);shift(-.04*prep+.028*abs(step),.04*go)
                for side,sgn in [('L',1),('R',-1)]:
                    r(side+'_Thigh','x',26*step*sgn);r(side+'_Shin','x',18*max(0,step*sgn))
                    r(side+'_Arm','x',20*go-19*step*sgn);r(side+'_Forearm','x',-24*go)
            elif name in ('Summon','Meeting'):
                v=hump(0,.55,.99);sign=-1 if qian else 1
                r('Head','y',12*v*sign);r('Chest','y',-13*v*sign);r('Spine','x',-5*v)
                r('R_Arm','x',-56*v);r('R_Arm','z',(-29 if qian else -9)*v);r('R_Forearm','x',(-35 if qian else -16)*v)
                r('R_Hand','y',19*v);r('L_Arm','z',12*v);r('Ponytail','z',14*v)
            elif name=='Whistle':
                v=ease(0,.37);r('R_Arm','y',40*v);r('R_Arm','x',-98*v)
                r('R_Forearm','x',-62*v);r('R_Hand','z',8*v);r('Head','x',10*v)
                r('Spine','x',-6*v);r('L_Arm','z',9*v)
            elif name=='Spread':
                p=hump(0,.33,.63);v=hump(.28,.694,1)
                r('Chest','y',-12*p+15*v);r('Spine','x',-5*p+13*v);shift(-.012*p,.035*v)
                for side,sign in [('L',1),('R',-1)]:
                    r(side+'_Arm','x',-24*p-49*v);r(side+'_Arm','z',sign*(5*p+21*v))
                    r(side+'_Forearm','x',-39*p-13*v)
            elif name=='Heal':
                v=ease(0,.22)*(1-.2*ease(.91,1));p=v*(.5+.5*math.sin(math.tau*2.8*t))
                r('Head','x',10*v);r('Chest','x',-6*v);r('Chest','z',2.8*p)
                for side,sign in [('L',1),('R',-1)]:
                    r(side+'_Arm','x',-24*v);r(side+'_Arm','z',sign*(11*v+12*p))
                    r(side+'_Forearm','x',-58*v+16*p)
            elif name=='Fall':
                v=ease(.09,1);r('Hips','z',-67*v if qian else 65*v);r('Head','x',11*v)
                r('R_Arm','z',-22*v);r('L_Arm','z',18*v);r('L_Shin','x',27*v);shift(-.27*v)
            low=pose(m)[:,1].min()
            if low<floor:shift(floor-low)
            return m
        return motion
    return factory

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--rig-zip',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    args=p.parse_args();args.output.mkdir(exist_ok=True,parents=True)
    with zipfile.ZipFile(args.rig_zip) as z:
        for kind,(title,number,moves,frames) in VARIANTS.items():
            profile=(COMMON|moves,title+'｜職場版','3D 動作分格｜保留遊戲原判定',
                     f'brave_guy_charactor{number}_{kind}_motion.glb',animate(kind.startswith('qian')),frames)
            bake(kind,z.read(f'GLB/{kind}_rig.glb'),args.output,motion_profile=profile)
