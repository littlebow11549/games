"""Bake Junxiong's campus and office ambush motions from the archived Tripo rigs."""
import argparse
import io
import math
import zipfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.spatial.transform import Rotation

from make_game02_ganqiao_motion import add, get, glb, load, pixels, repack, xform

ROLES={'junxiong':'俊熊・校園版','junxiong_office':'已讀俊熊・職場版'}
DURATIONS={'Peek':1.2,'Startle':.9,'Caught':.9}

def bake(kind, data, out):
    j,b=load(data)
    nodes=j['nodes']
    skin=j['skins'][0]; joints=skin['joints']
    named={nodes[i]['name']:i for i in joints}
    a=j['meshes'][0]['primitives'][0]['attributes']
    p,n,uv,ids,w=[get(j,b,a[k]) for k in ('POSITION','NORMAL','TEXCOORD_0','JOINTS_0','WEIGHTS_0')]
    idx=get(j,b,j['meshes'][0]['primitives'][0]['indices']).ravel().astype('int64')
    ib=get(j,b,skin['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1)
    view=j['bufferViews'][j['images'][0]['bufferView']]
    off=view.get('byteOffset',0)
    tex=np.array(Image.open(io.BytesIO(b[off:off+view['byteLength']])).convert('RGB'))
    # Weld duplicates before smoothing native Tripo weights; keep texture seams intact.
    _,ix,inv=np.unique(np.round(p,5),axis=0,return_index=True,return_inverse=True)
    ed=np.unique(np.sort(inv[idx.reshape(-1,3)[:,[0,1,1,2,2,0]]].reshape(-1,2),axis=1),axis=0)
    a0,a1=ed[ed[:,0]!=ed[:,1]].T
    neighbor=np.maximum(1,np.bincount(np.r_[a0,a1],minlength=len(ix)))[:,None]
    weights=np.zeros((len(p),len(joints)),dtype=np.float32)
    np.add.at(weights,(np.broadcast_to(np.arange(len(p))[:,None],ids.shape),ids),w)
    welded=np.zeros((len(ix),len(joints)),dtype=np.float32)
    np.add.at(welded,inv,weights)
    welded/=np.bincount(inv)[:,None]
    initial=welded.copy()
    for _ in range(14):
        pooled=np.zeros_like(welded)
        np.add.at(pooled,a0,welded[a1]);np.add.at(pooled,a1,welded[a0])
        welded=.05*initial+.42*welded+.53*np.where(neighbor>1,pooled/neighbor,welded)
    weights=welded[inv]
    ids=np.argsort(-weights,axis=1)[:,:4]
    w=np.take_along_axis(weights,ids,axis=1);w/=w.sum(1,keepdims=True)
    b,tex=repack(j,b,np.arange(len(p)),idx,p,n,uv,ids,w,ib,tex)
    loc=np.stack([xform(node) for node in nodes])
    parent={kid:i for i,no in enumerate(nodes) for kid in no.get('children',[])}
    def pose(m):
        world={}
        def absolute(i):
            if i not in world:world[i]=absolute(parent[i])@m[i] if i in parent else m[i]
            return world[i]
        skinmat=(np.stack([absolute(i) for i in joints])@ib)[ids]
        return ((np.einsum('nkij,nj->nki',skinmat[:,:,:3,:3],p)+skinmat[:,:,:3,3])*w[:,:,None]).sum(1)
    assert np.max(abs(pose(loc)-p))<.002
    office=kind.endswith('_office')
    def motion(name,t):
        m=loc.copy()
        def r(bone,axis,val):
            i=named[bone]
            m[i,:3,:3] = m[i,:3,:3] @ Rotation.from_euler(axis,val,degrees=True).as_matrix()
        def move(y,z=0):
            m[named['Hips'],1:3,3]+=[y,z]
        def ease(x,a,b):
            u=np.clip((x-a)/(b-a),0,1)
            return u*u*(3-2*u)
        sn=math.sin(math.tau*t)
        if name=='Peek':
            r('Head','z',sn*(5 if office else 8));r('Head','y',-5*sn)
            r('Spine','x',6);r('Head','x',-5)
            for side in ('L','R'):r(side+'_Forearm','x',-8+3*sn)
        elif name=='Startle':
            spring=ease(t,0,.16);settle=ease(t,.24,.52);hide=ease(t,.55,1)
            leap=spring*(1-settle); startle=spring*(1-.7*settle)*(1-hide)
            move(.108*leap-.99*hide,.032*startle)
            r('Spine','x',10*startle-8*leap);r('Head','x',-11*leap);r('Head','z',6*settle*(1-hide))
            for side,sgn in [('L',1),('R',-1)]:
                r(side+'_Arm','z',sgn*(9 if office else 14)*startle)
                r(side+'_Arm','x',-(12 if office else 18)*startle)
                r(side+'_Forearm','x',-9*startle)
                r(side+'_Thigh','x',-4*leap);r(side+'_Shin','x',7*leap)
        else:
            recoil=ease(t,0,.12)*(1-ease(t,.18,.55));hide=ease(t,.18,.8)
            r('Spine','x',-12*recoil+11*hide);r('Head','x',-10*recoil+17*hide)
            move(.045*recoil,-.045*recoil)
            for side,sgn in [('L',1),('R',-1)]:
                r(side+'_Arm','z',sgn*9*recoil)
                r(side+'_Arm','x',-10*recoil-6*hide)
                r(side+'_Forearm','x',-6*recoil-12*hide)
        return m

    sheet=Image.new('RGB',(1084,808),'#ebebeb');paint=ImageDraw.Draw(sheet)
    fp=Path('C:/Windows/Fonts/msjhbd.ttc');fp=str(fp) if fp.exists() else 'DejaVuSans.ttf'
    big=ImageFont.truetype(fp,35);small=ImageFont.truetype(fp,21)
    paint.text((26,20),ROLES[kind],font=big,fill='#242034')
    paint.text((28,67),'遊戲 GLB 動作分格｜灰線是地面，躲藏時下半身在地面以下',font=small,fill='#544b60')
    _,ix,inv=np.unique(np.round(p,5),axis=0,return_index=True,return_inverse=True)
    edges=np.unique(np.sort(inv[idx.reshape(-1,3)[:,[0,1,1,2,2,0]]].reshape(-1,2),axis=1),axis=0)
    def lens(x):return np.linalg.norm(x[ix][edges[:,0]]-x[ix][edges[:,1]],axis=1)
    rest=lens(p);good=rest>.005
    frames={
        'Peek':('埋伏探頭',[0,.25,.55,.85]),
        'Startle':('突然冒出 → 嚇人 → 縮回',[0,.16,.47,.75]),
        'Caught':('被抓到 → 往回縮',[0,.12,.28,.48]),
    }
    j['animations']=[]
    for row,(name,dur) in enumerate(DURATIONS.items()):
        times=np.linspace(0,1,37)
        mats=np.stack([motion(name,t) for t in times])
        stretches=[np.quantile(lens(pose(m))[good]/rest[good],.995) for m in mats]
        peak=max(stretches)
        print(kind,name,'edge stretch p99.5:',round(peak,3),flush=True)
        assert peak<1.7
        si=add(j,b,(times*dur).astype('<f4'),'SCALAR',limits=True)
        channels=[];samplers=[]
        def add_track(node,path,values,typ):
            a=add(j,b,values.astype('<f4'),typ)
            samplers.append(dict(input=si,output=a,interpolation='LINEAR'))
            channels.append(dict(sampler=len(samplers)-1,target=dict(node=node,path=path)))
        for i in joints:
            if np.max(np.abs(mats[:,i,:3,:3]-loc[i,:3,:3]))>1e-5:
                q=Rotation.from_matrix(mats[:,i,:3,:3]).as_quat()
                add_track(i,'rotation',q,'VEC4')
            if np.max(np.abs(mats[:,i,:3,3]-loc[i,:3,3]))>1e-5:
                add_track(i,'translation',mats[:,i,:3,3],'VEC3')
        j['animations'].append(dict(name=name,samplers=samplers,channels=channels))
        desc,shots=frames[name]; y=123+row*215
        paint.text((28,y),desc,font=small,fill='#242034')
        for col,t in enumerate(shots):
            pts=pose(motion(name,t))
            ground=-.6+.06*math.sin(t*1.2*14)+min(.2,.24*t) if name=='Peek' else max(-1.2,-.41-1.8*t) if name=='Caught' else 0
            pts[:,1]+=ground
            pts=(pts@Rotation.from_euler('y',-29,degrees=True).as_matrix().T).astype(np.float32)
            pts[:,0]=126+134*pts[:,0];pts[:,1]=160-132*pts[:,1]
            pic=Image.fromarray(pixels(pts*2,idx,uv,tex,504,320)).resize((252,160),Image.Resampling.LANCZOS)
            x=28+col*260;sheet.paste(pic,(x,y+35))
            paint.line((x+18,y+195,x+234,y+195),fill='#8a8194',width=2)
            paint.text((x+9,y+42),f'{t*dur:.2f}s',font=small,fill='#544b60')
    (out/f'brave_guy_charactor06_{kind}_motion.glb').write_bytes(glb(j,b))
    sheet.save(out/f'BraveGuy_{kind}_Motion_QA.jpg',quality=92,optimize=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rig-zip',required=True,type=Path)
    parser.add_argument('--output',required=True,type=Path)
    args=parser.parse_args()
    args.output.mkdir(exist_ok=True,parents=True)
    with zipfile.ZipFile(args.rig_zip) as z:
        for kind in ROLES:
            bake(kind,z.read(f'GLB/{kind}_rig.glb'),args.output)
