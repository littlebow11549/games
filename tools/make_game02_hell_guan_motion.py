"""Build 2-2 and 3-5 boss motion from archived Tripo skeletons."""
import argparse
import math
from pathlib import Path
import zipfile

from scipy.spatial.transform import Rotation

from make_game02_incubus_motion import bake

COMMON={'Idle':1.45,'Run':.72,'Spawn':.45,'Fall':.88}
ROLES={
    'hell':('地獄超人','14','2-2',
            {'Rush':.95,'Quake':.9,'Fire':.51,'Taunt':.7,'Ki':.7},
            {'Rush':('衝拳・0.50 秒後突進',[0,.42,.63,.87]),
             'Quake':('震地・0.80 秒判定',[0,.4,.70,.889]),
             'Fire':('黑火・即時出現預警',[0,.22,.51,.85]),
             'Ki':('氣功彈・0.50 秒出手',[0,.32,.714,.90]),
             'Taunt':('情勒・即時增加罪惡感',[0,.28,.48,.83]),
             'Fall':('落敗',[0,.3,.68,1])}),
    'boss_guan':('冠老闆','25','3-5',
            {'Dive':2.2,'Pies':.41,'Spread':.72},
            {'Dive':('起飛 → 鎖定 → 俯衝落地',[0,.38,1.6/2.2,1]),
             'Pies':('畫大餅・即時放置道具',[0,.23,.53,.87]),
             'Spread':('扇射・0.50 秒出手',[0,.38,.694,.94]),
             'Fall':('落敗',[0,.32,.61,1])})
}

def factory(is_hell):
    def build(loc,names,pose):
        root='Hips' if is_hell else 'Body'
        floor=float(pose(loc)[:,1].min())
        def motion(name,t):
            m=loc.copy()
            def r(b,axis,a):
                i=names[b]
                m[i,:3,:3]=m[i,:3,:3]@Rotation.from_euler(axis,a,degrees=True).as_matrix()
            def y(a): m[names[root],1,3]+=a
            def z(a): m[names[root],2,3]+=a
            def ease(a,b):
                u=max(0.,min(1.,(t-a)/(b-a)));return u*u*(3-2*u)
            def hump(a,b,c):return ease(a,b)*(1-ease(b,c))
            s=math.sin(math.tau*t)
            if is_hell:
                r('Scarf','x',5*s); r('Scarf','z',4*s)
                if name=='Idle':
                    r('Chest','x',2.2*s);r('Head','y',3.5*s);r('L_Arm','z',1.4*s);r('R_Arm','z',-1.4*s)
                elif name=='Run':
                    y(.02*s*s);r('Spine','x',11);r('Chest','y',7*s);r('Scarf','x',-18)
                    for side,sgn in [('L',1),('R',-1)]:
                        a=s*sgn;r(side+'_Arm','x',-20*a);r(side+'_Forearm','x',-15+9*a)
                        r(side+'_Thigh','x',24*a);r(side+'_Shin','x',20*max(0,-a))
                elif name=='Rush':
                    a=hump(.02,.43,.56);v=ease(.47,.61)*(1-ease(.76,1))
                    r('Chest','y',-21*a+25*v);r('Spine','x',-8*a+20*v);r('Scarf','x',-28*v)
                    r('R_Arm','x',-14*a-68*v);r('R_Forearm','x',-49*a-8*v)
                    r('L_Arm','x',-16*a+24*v);r('L_Thigh','x',21*v);r('R_Thigh','x',-21*v);y(-.043*a);z(.046*v)
                elif name=='Quake':
                    a=hump(0,.63,.889);v=ease(.66,.889)*(1-.3*ease(.92,1))
                    r('Spine','x',-10*a+24*v);r('Head','x',-11*a+15*v);y(.02*a-.075*v)
                    for side,sgn in [('L',1),('R',-1)]:
                        r(side+'_Arm','x',-74*a-38*v);r(side+'_Arm','z',sgn*(18*a+9*v))
                        r(side+'_Forearm','x',-34*a-18*v);r(side+'_Shin','x',17*v)
                elif name in ('Fire','Taunt','Ki','Spawn'):
                    center=.714 if name=='Ki' else .43 if name=='Taunt' else .5
                    v=hump(0,center,1);p=hump(0,.35,.68)
                    if name=='Ki':
                        r('Chest','y',-12*p+19*v);r('Spine','x',11*v);z(.035*v)
                        r('R_Arm','x',-64*v);r('R_Forearm','x',-28*p-11*v);r('L_Arm','x',-34*v);r('L_Forearm','x',-37*p)
                    elif name=='Taunt':
                        r('Chest','y',19*v);r('Head','z',-12*v);r('R_Arm','x',-49*v);r('R_Forearm','x',-38*v);r('R_Hand','y',18*v)
                    else:
                        r('Spine','x',-12*v);r('Head','x',-9*v)
                        for side,sgn in [('L',1),('R',-1)]:
                            r(side+'_Arm','z',sgn*(32 if name=='Fire' else 18)*v)
                            r(side+'_Arm','x',(-42 if name=='Fire' else -25)*v);r(side+'_Forearm','x',-18*v)
                elif name=='Fall':
                    v=ease(.08,1);r(root,'z',-66*v);r('Head','x',15*v);r('L_Arm','z',21*v);r('R_Shin','x',24*v);y(-.27*v)
            else:
                if name=='Idle':
                    r('Head','z',2*s);r('Neck','x',2.4*s);r('Tail','x',3*s)
                elif name=='Run':
                    r(root,'x',9);r(root,'z',3.3*s);r('Tail','x',7*s);y(.022*s*s)
                    for side,sgn in [('L',1),('R',-1)]:
                        r(side+'_Leg','x',19*sgn*s);r(side+'_Foot','x',-12*sgn*s);r(side+'_Wing','z',sgn*7*s)
                elif name=='Dive':
                    fly=ease(0,.14)*(1-ease(.71,.94));drop=hump(.69,.84,.99)
                    flap=math.sin(math.tau*4*t)*fly
                    r(root,'x',-12*fly+31*drop);r('Head','x',-7*drop);r('Tail','x',-18*fly+13*drop)
                    for side,sgn in [('L',1),('R',-1)]:
                        r(side+'_Wing','z',sgn*(30*fly+24*flap+13*drop))
                        r(side+'_Wing','x',-15*fly+26*drop);r(side+'_WingTip','z',sgn*(12*fly+18*flap))
                        r(side+'_Leg','x',26*fly-18*drop)
                elif name=='Pies':
                    v=hump(0,.46,1)
                    r('Head','z',-13*v);r(root,'y',16*v);r('R_Wing','x',-44*v);r('R_Wing','z',-28*v);r('R_WingTip','x',-27*v)
                    r('Neck','x',11*v);r('L_Wing','z',13*v)
                elif name=='Spread':
                    a=hump(0,.36,.694);v=hump(.33,.694,1)
                    r(root,'x',-11*a+17*v);r('Head','x',15*a-12*v);r('Tail','x',12*v)
                    for side,sgn in [('L',1),('R',-1)]:
                        r(side+'_Wing','z',sgn*(16*a+42*v));r(side+'_Wing','x',-29*v);r(side+'_WingTip','z',sgn*20*v)
                elif name=='Spawn':
                    v=hump(0,.53,1);r('Head','x',-11*v);r('Head','y',12*v);r('L_Wing','z',24*v);r('R_Wing','z',-24*v);y(.036*v)
                elif name=='Fall':
                    v=ease(.08,1);r(root,'z',-68*v);r('Neck','x',-17*v);r('L_Wing','z',25*v);r('R_Wing','z',-14*v);y(-.23*v)
            if name!='Dive':
                low=float(pose(m)[:,1].min())
                if low<floor:y(floor-low)
            return m
        return motion
    return build

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rig-zip',type=Path,required=True);parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args();args.output.mkdir(exist_ok=True,parents=True)
    with zipfile.ZipFile(args.rig_zip) as source:
        for key,(name,number,stage,moves,frames) in ROLES.items():
            profile=(COMMON|moves,name,stage+'｜3D 動作分格・遊戲模型',
                     f'brave_guy_charactor{number}_{key}_motion.glb',factory(key=='hell'),frames)
            bake(key,source.read(f'GLB/{key}_rig.glb'),args.output,motion_profile=profile)
