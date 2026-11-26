"""Retarget the student's game clips to the archived office worker rig."""
import argparse
import zipfile
from pathlib import Path
import numpy as np
from scipy.spatial.transform import Rotation, Slerp
from make_game02_incubus_motion import bake
from make_game02_ganqiao_motion import get, load, xform

DEFAULT_STUDENT=Path(__file__).resolve().parents[1]/'02_brave_guy/assets/runtime/stage-art/brave_guy_charactor01_student_motion.glb'
NAME_MAP={side+short:fullname+'_'+part for side,fullname in [('Left','L'),('Right','R')]
          for short,part in [('Arm','Arm'),('ForeArm','Forearm'),('Hand','Hand'),('UpLeg','Thigh'),('Leg','Shin'),('Foot','Foot')]}
FRAMES={'Run':('跑動｜前後步態',[0,.25,.5,.75]),
        'Punch_R':('右拳｜出拳與收拳',[0,.2,.35,.7]),
        'Dodge':('閃避｜側移再回到待機',[0,.27,.51,.79]),
        'Transform':('變身前｜蓄力動作',[0,.27,.55,.82])}

def profiles(source):
    j,b=load(source)
    durations={};clips={}
    for a in j['animations']:
        name=a['name']
        channels=[]
        for ch in a['channels']:
            node=j['nodes'][ch['target']['node']]
            n=node['name'].removeprefix('mixamorig:');typ=ch['target']['path']
            if typ=='weights':continue  # Student-shirt-only corrective shapes never transfer.
            sampler=a['samplers'][ch['sampler']]
            assert sampler.get('interpolation','LINEAR')=='LINEAR'
            times=get(j,b,sampler['input']).ravel().astype(float)
            values=get(j,b,sampler['output']).astype(float)
            durations[name]=max(durations.get(name,0),round(float(times[-1]),5))
            bind=xform(node)
            if typ=='rotation':
                delta=Rotation.from_matrix(bind[:3,:3]).inv()*Rotation.from_quat(values)
                vec=delta.as_rotvec()
                # The office shirt uses shorter sleeves around narrower elbows than the student.
                if n.endswith(('Arm','ForeArm')):vec*=.78
                channels.append((NAME_MAP.get(n,n),typ,times,Slerp(times,Rotation.from_rotvec(vec))))
            elif typ=='translation':
                channels.append((NAME_MAP.get(n,n),typ,times,(values-bind[:3,3])*.92))
            else:raise ValueError(typ)
        clips[name]=channels
    def sample(loc,lookup,pose):
        def motion(name,t):
            m=loc.copy();sec=t*durations[name]
            for n,typ,times,values in clips[name]:
                i=lookup[n]
                x=np.clip(sec,times[0],times[-1])
                if typ=='rotation':m[i,:3,:3]=loc[i,:3,:3]@values(x).as_matrix()
                else:m[i,:3,3]+=np.array([np.interp(x,times,col) for col in values.T])
            if name.startswith('Punch_'):
                right=name.endswith('_R');side='R' if right else 'L'
                follow=np.interp(t,[0,.16,.34,.54,1],[0,0,1,.68,0])
                i=lookup[side+'_Arm']
                m[i,:3,:3] = m[i,:3,:3]@Rotation.from_euler('x',-18*follow,degrees=True).as_matrix()
            # Keep shoes planted in running/falling frames. Root displacement is owned by game code.
            ground=np.quantile(pose(m)[:,1],.00075)
            if ground<0 or name=='Die':m[lookup['Hips'],1,3]-=ground
            return m
        return motion
    return durations,'勇氣超人・上班族','職場篇｜遊戲用 GLB 動作分格','brave_guy_charactor15_worker_motion.glb',sample,FRAMES

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rig-zip',required=True,type=Path)
    parser.add_argument('--student',type=Path,default=DEFAULT_STUDENT)
    parser.add_argument('--output',required=True,type=Path)
    args=parser.parse_args()
    args.output.mkdir(exist_ok=True,parents=True)
    with zipfile.ZipFile(args.rig_zip) as z:
        bake('office_worker',z.read('GLB/office_worker_rig.glb'),args.output,motion_profile=profiles(args.student.read_bytes()))
