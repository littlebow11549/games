"""Bake the overtime guard and king clips from the original archived Tripo rig."""
import argparse
import math
from pathlib import Path
import zipfile

from scipy.spatial.transform import Rotation
from make_game02_incubus_motion import bake

DURATIONS={'Idle':1.45,'Run':.70,'Attack':.8,'Hit':.24,'Fall':.88,'Spawn':.45,
           'Slam':.95,'Charge':1.5,'Summon':.52}
FRAMES={'Run':('加班鬼・追擊',[0,.22,.48,.71]),
        'Attack':('加班鬼・0.55 秒出手',[0,.34,.6875,.92]),
        'Slam':('加班鬼王・0.95 秒砸地',[0,.32,.71,1]),
        'Charge':('加班鬼王・0.70 秒後衝撞',[0,.33,.60,.88]),
        'Summon':('加班鬼王・召喚',[0,.3,.56,.88]),
        'Fall':('落敗',[0,.34,.67,1])}

def factory(loc,names,pose):
    floor=float(pose(loc)[:,1].min())
    def motion(name,t):
        m=loc.copy()
        def r(b,a,v):
            i=names[b]
            m[i,:3,:3]=m[i,:3,:3]@Rotation.from_euler(a,v,degrees=True).as_matrix()
        def y(v):m[names['Hips'],1,3]+=v
        def ease(a,b):
            u=max(0,min(1.,(t-a)/(b-a)));return u*u*(3-2*u)
        def hump(a,b,c):return ease(a,b)*(1-ease(b,c))
        s=math.sin(math.tau*t)
        if name=='Idle':
            r('Head','x',5+3*s);r('Chest','z',1.8*s)
            r('L_Forearm','x',-7);r('R_Forearm','x',-5)
        elif name=='Run':
            y(.015*s*s);r('Spine','x',10);r('Chest','y',7*s);r('Head','x',-4+4*s)
            for b,sgn in [('L',1),('R',-1)]:
                u=s*sgn;r(b+'_Arm','x',-24*u);r(b+'_Forearm','x',-11+8*u)
                r(b+'_Thigh','x',22*u);r(b+'_Shin','x',18*max(0,-u))
        elif name=='Attack':
            a=hump(0,.41,.68);v=hump(.4,.6875,1)
            r('Spine','x',-6*a+13*v);r('Chest','y',-20*a+23*v);r('Head','y',8*a-12*v)
            r('R_Arm','x',-23*a-60*v);r('R_Arm','z',-20*a-10*v);r('R_Forearm','x',-40*a-11*v)
            r('L_Arm','x',-24*v);r('R_Thigh','x',-11*v);y(-.025*v)
        elif name=='Slam':
            a=hump(0,.6,.98);v=ease(.68,1)
            r('Spine','x',-10*a+24*v);r('Head','x',-8*a+12*v);y(.018*a-.081*v)
            for side,sign in [('L',1),('R',-1)]:
                r(side+'_Arm','x',-66*a-40*v);r(side+'_Arm','z',sign*19*a)
                r(side+'_Forearm','x',-34*a-13*v);r(side+'_Shin','x',18*v)
        elif name=='Charge':
            a=hump(0,.38,.56);v=ease(.44,.63);s=math.sin(math.tau*5*t)*v
            r('Spine','x',-7*a+22*v);r('Head','x',8*a-9*v);y(-.041*a+.027*abs(s))
            for side,sign in [('L',1),('R',-1)]:
                r(side+'_Thigh','x',25*s*sign);r(side+'_Shin','x',17*max(0,s*sign))
                r(side+'_Arm','x',-32*a-13*v);r(side+'_Forearm','x',-24*a-32*v)
        elif name in ('Spawn','Summon'):
            a=hump(0,.56,1);r('Head','z',-11*a);r('Spine','x',-5*a)
            r('R_Arm','x',(-65 if name=='Summon' else -29)*a)
            r('R_Arm','z',-17*a);r('R_Forearm','x',-33*a);r('L_Arm','z',11*a)
        elif name=='Hit':
            a=hump(0,.22,1);r('Chest','x',-17*a);r('Head','z',12*a);y(-.019*a)
        elif name=='Fall':
            v=ease(.08,.98);r('Hips','z',-67*v);r('L_Arm','z',16*v);r('R_Shin','x',24*v);y(-.26*v)
        low=float(pose(m)[:,1].min())
        if low<floor:y(floor-low)
        return m
    return motion

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--rig-zip',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    args=p.parse_args();args.output.mkdir(exist_ok=True,parents=True)
    with zipfile.ZipFile(args.rig_zip) as z:
        profile=(DURATIONS,'加班鬼・加班鬼王','職場篇｜3D 動作分格',
                 'brave_guy_charactor16_kaban_king_motion.glb',factory,FRAMES)
        bake('kaban',z.read('GLB/kaban_rig.glb'),args.output,motion_profile=profile)
