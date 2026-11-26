"""Bake Incubus's suit and Final Ascension boss motions from the archived Tripo rigs."""
import argparse
import io
import math
import zipfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.spatial.transform import Rotation

from make_game02_folaidi_motion import relax
from make_game02_ganqiao_motion import add, get, glb, load, pixels, repack, xform

ROLES={'incubus':'夢魘超人・西裝','incubus_final':'夢魘超人・最終昇華'}
DURATIONS={'Idle':1.7,'Run':.7,'Talk':.7,'Windup':.55,'Punch':.4,'Hook':.4,'Sweep':.4,'Dash':1.3,'Drones':.8,'Shout':.8,'King':1.15,'Wave':2.,'FinalDash':.95,'Quake':.85,'Awaken':.72,'Hit':.24,'Fall':.9}

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
    def matrices(m):
        world={}
        def absolute(i):
            if i not in world:world[i]=absolute(parent[i])@m[i] if i in parent else m[i]
            return world[i]
        return (np.stack([absolute(i) for i in joints])@ib)[ids]
    def pose(m):
        skinmat=matrices(m)
        return ((np.einsum('nkij,nj->nki',skinmat[:,:,:3,:3],p)+skinmat[:,:,:3,3])*w[:,:,None]).sum(1)
    assert np.max(abs(pose(loc)-p))<.002
    armor=kind.endswith('_final')
    def motion(name,t):
        m=loc.copy()
        def r(bone,axis,val):
            i=named[bone]
            if bone.endswith(('_Arm','_Forearm')):val*=.73
            m[i,:3,:3] = m[i,:3,:3] @ Rotation.from_euler(axis,val,degrees=True).as_matrix()
        def move(y,z=0):
            m[named['Hips'],1:3,3]+=[y,z]
        def ease(x,a,b):
            u=np.clip((x-a)/(b-a),0,1)
            return u*u*(3-2*u)
        sn=math.sin(math.tau*t)
        pulse=lambda x: math.sin(math.pi*np.clip(x,0,1))
        hump=lambda a,b,c: ease(t,a,b)*(1-ease(t,b,c))
        release=lambda a,b,c: ease(t,a,b)*(1-ease(t,b,c)*.65)
        if 'Scarf' in named:
            r('Scarf','x',4*sn);r('Scarf','z',3*math.sin(math.tau*t+.5))
        if name=='Idle':
            r('Spine','z',1.6*sn);r('Head','y',3*sn);move(.004*sn)
        elif name=='Run':
            move(.017*(sn*sn),0);r('Spine','x',10 if armor else 6);r('Chest','y',6*sn)
            for side,sgn in [('L',1),('R',-1)]:
                arm=sgn*sn
                r(side+'_Arm','x',-15*arm);r(side+'_Forearm','x',-11-5*arm)
                r(side+'_Thigh','x',21*arm);r(side+'_Shin','x',20*max(0,-arm))
                r(side+'_Foot','x',-7*arm)
            if armor:r('Scarf','x',-14+6*sn)
        elif name in ('Talk','Windup'):
            w=hump(0,.48,1) if name=='Talk' else ease(t,0,.94)
            r('Spine','x',-(4 if name=='Talk' else 9)*w);r('Head','x',7*w)
            r('Chest','y',(-11 if name=='Talk' else 13)*w)
            r('R_Arm','x',-23*w);r('R_Arm','z',-7*w);r('R_Forearm','x',-24*w)
            r('L_Arm','x',-12*w);r('L_Forearm','x',-16*w)
        elif name in ('Punch','Hook','Sweep'):
            w=release(0,.16,1); side='L' if name=='Hook' else 'R';sign=1 if side=='L' else -1
            r('Chest','y',-sign*(19 if name=='Sweep' else 16)*w)
            r('Spine','x',10*w);r('Head','y',sign*8*w);move(-.021*w,.054*w)
            r(side+'_Arm','x',-(55 if armor else 60)*w)
            r(side+'_Arm','y',-sign*(18 if name=='Sweep' else 10)*w)
            r(side+'_Forearm','x',(-24 if name=='Hook' else -12)*w)
            if name=='Sweep':r('L_Arm','x',-35*w);r('L_Arm','z',12*w)
        elif name in ('Dash','FinalDash'):
            w=ease(t,.12,.54);go=hump(.49,.69,1) if name=='Dash' else hump(.44,.62,1)
            r('Spine','x',-7*w+20*go);r('Head','x',-10*go);move(-.055*w+.036*go,.043*go)
            r('R_Arm','x',-13*w-49*go);r('R_Forearm','x',-28*w+17*go)
            r('L_Arm','x',-12*w+25*go)
            r('R_Thigh','x',-22*go);r('R_Shin','x',23*go);r('L_Thigh','x',17*go)
            if armor:r('Scarf','x',-27*go)
        elif name in ('Drones','Shout','King','Wave','Quake'):
            peaks={'Drones':.75,'Shout':.81,'King':.85,'Wave':.45,'Quake':.89}
            peak=peaks[name];a=ease(t,0,peak*.69);v=ease(t,peak*.60,peak)
            if name in ('Wave','Quake'):v*=1-.7*ease(t,peak,1)
            for side,sgn in [('L',1),('R',-1)]:
                opening={'Drones':23,'Shout':13,'King':31,'Wave':30,'Quake':11}[name]
                arm={'Drones':-24,'Shout':-44,'King':-55,'Wave':-39,'Quake':-57}[name]
                r(side+'_Arm','z',sgn*opening*v)
                r(side+'_Arm','x',arm*v-14*a)
                r(side+'_Forearm','x',-25*a+18*v)
            r('Spine','x',-7*a+(19 if name=='Quake' else 12)*v)
            r('Head','x',-8*a+8*v)
            move((-.072 if name=='Quake' else -.014)*v,0)
            if armor:r('Scarf','x',-11*v)
        elif name=='Awaken':
            g=hump(0,.36,1);w=hump(.06,.51,1)
            move(.069*g,0);r('Head','x',-13*g);r('Chest','x',-7*g)
            for side,sgn in [('L',1),('R',-1)]:
                r(side+'_Arm','z',sgn*31*w);r(side+'_Arm','x',-20*w);r(side+'_Forearm','x',-9*w)
            if armor:r('Scarf','x',-18*w)
        elif name=='Hit':
            w=hump(0,.21,1);r('Spine','x',-12*w);r('Head','x',-8*w);move(-.012*w,-.052*w)
        elif name=='Fall':
            w=ease(t,.07,.98);r('Hips','z',66*w);r('Hips','x',-12*w)
            for side,sgn in [('L',1),('R',-1)]:
                r(side+'_Arm','z',sgn*12*w);r(side+'_Shin','x',12*w)
            move(-.36*w,0)
        low=np.min(pose(m)[:,1])
        if low<0:move(-low,0)
        return m

    sheet=Image.new('RGB',(1084,1018),'#ebebeb');paint=ImageDraw.Draw(sheet)
    fp=Path('C:/Windows/Fonts/msjhbd.ttc');fp=str(fp) if fp.exists() else 'DejaVuSans.ttf'
    big=ImageFont.truetype(fp,35);small=ImageFont.truetype(fp,21)
    paint.text((26,20),ROLES[kind],font=big,fill='#242034')
    paint.text((28,67),'4-1 董事長室｜由遊戲用 GLB 擷取的動作分格',font=small,fill='#544b60')
    _,ix,inv=np.unique(np.round(p,5),axis=0,return_index=True,return_inverse=True)
    edges=np.unique(np.sort(inv[idx.reshape(-1,3)[:,[0,1,1,2,2,0]]].reshape(-1,2),axis=1),axis=0)
    def lens(x):return np.linalg.norm(x[ix][edges[:,0]]-x[ix][edges[:,1]],axis=1)
    rest=lens(p);good=rest>.005
    frames={
        'Idle':('西裝・待機',[0,.25,.5,.75]),
        'Talk':('西裝・施壓',[0,.29,.53,.82]),
        'Punch':('西裝・近戰連段起手',[0,.23,.51,.83]),
        'Drones':('西裝・浮游砲',[0,.32,.64,.88]),
    } if not armor else {
        'Awaken':('戰甲・覺醒落地',[0,.29,.54,.86]),
        'Dash':('戰甲・衝拳',[0,.32,.67,.90]),
        'Wave':('戰甲・蓄力與衝擊波',[0,.26,.51,.86]),
        'Fall':('戰甲・倒地',[0,.31,.62,1]),
    }
    # Repair the moving shoulder/cuff surfaces in mesh space. Keep original topology.
    j['animations']=[]
    times=np.linspace(0,1,29)
    sample={name:np.stack([motion(name,t) for t in times]) for name in DURATIONS}
    correction=[]; trimap={}
    def linear(m):return (matrices(m)[:,:,:3,:3]*w[:,:,None,None]).sum(1)
    for name,mats in sample.items():
        if name in ('Idle','Hit','Fall'):continue
        begin=len(correction)
        for m in mats[::2]:
            skin=pose(m);edge=lens(skin)
            mask=(edge>rest*1.32+.00065)&(edge-rest>.0013)
            mobile=np.zeros(len(ix),dtype=np.float32);mobile[edges[mask].ravel()]=.88
            mobile[p[ix,1]>.795]=0
            dst=relax(skin[ix].astype(np.float32),rest.astype(np.float32),edges,mobile)
            delta=(dst-skin[ix])[inv]
            sel=np.linalg.norm(delta,axis=1)>.00017
            rest_delta=np.zeros_like(p)
            rest_delta[sel]=(np.linalg.pinv(linear(m)[sel])@delta[sel,:,None])[:,:,0]
            correction.append(rest_delta.ravel())
        trimap[name]=slice(begin,len(correction))
    A=np.stack(correction).astype(np.float32)
    eigen,V=np.linalg.eigh(A@A.T);take=np.flatnonzero(eigen>1e-8)[-11:]
    basis=((V[:,take].T@A)/np.sqrt(eigen[take,None])).reshape(-1,len(p),3).astype('<f4')
    co=(V[:,take]*np.sqrt(eigen[take])).astype('<f4')
    primitive=j['meshes'][0]['primitives'][0]
    primitive['targets']=[]
    for v in basis:
        inds=np.flatnonzero(np.linalg.norm(v,axis=1)>.00042)
        notkept=np.ones(len(v),dtype=bool);notkept[inds]=False;v[notkept]=0
        ia=add(j,b,inds.astype('<u2'),'SCALAR')
        iv=add(j,b,v[inds],'VEC3')
        primitive['targets'].append({'POSITION':len(j['accessors'])})
        j['accessors'].append(dict(componentType=5126,count=len(p),type='VEC3',
           min=np.minimum(v.min(0),0).tolist(),max=np.maximum(v.max(0),0).tolist(),
           sparse=dict(count=len(inds),indices=dict(bufferView=j['accessors'][ia]['bufferView'],componentType=5123),
               values=dict(bufferView=j['accessors'][iv]['bufferView']))))
    j['meshes'][0]['weights']=[0]*len(basis)
    mesh_node=next(i for i,n in enumerate(nodes) if n.get('mesh')==0 and 'skin' in n)
    for name,dur in DURATIONS.items():
        mats=sample[name]
        coeff=np.column_stack([np.interp(times,times[::2],v) for v in co[trimap[name]].T]) if name in trimap else np.zeros((len(times),len(basis)))
        def posed(m,weights):
            skin=pose(m)
            if name not in trimap:return skin
            return skin+(linear(m)@np.tensordot(weights,basis,axes=1)[:,:,None])[:,:,0]
        peak=max(np.quantile(lens(posed(m,v))[good]/rest[good],.995) for m,v in zip(mats,coeff))
        print(kind,name,'corrected edge stretch p99.5:',round(peak,3),flush=True)
        assert peak<3.4
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
        if name in trimap:add_track(mesh_node,'weights',coeff.ravel(),'SCALAR')
        j['animations'].append(dict(name=name,samplers=samplers,channels=channels))
        if name not in frames:continue
        desc,shots=frames[name]; y=123+list(frames).index(name)*215
        paint.text((28,y),desc,font=small,fill='#242034')
        for col,t in enumerate(shots):
            weights=np.array([np.interp(t,times,c) for c in coeff.T]);pts=posed(motion(name,t),weights)
            pts=(pts@Rotation.from_euler('y',-29,degrees=True).as_matrix().T).astype(np.float32)
            pts[:,0]=126+134*pts[:,0];pts[:,1]=160-132*pts[:,1]
            pic=Image.fromarray(pixels(pts*2,idx,uv,tex,504,320)).resize((252,160),Image.Resampling.LANCZOS)
            x=28+col*260;sheet.paste(pic,(x,y+35))
            paint.line((x+18,y+195,x+234,y+195),fill='#8a8194',width=2)
            paint.text((x+9,y+42),f'{t*dur:.2f}s',font=small,fill='#544b60')
    (out/f'brave_guy_charactor26_{kind}_motion.glb').write_bytes(glb(j,b))
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
