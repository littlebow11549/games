"""Bake the existing Folaidi rig into one shared game model; use --rig-zip and --output."""
import argparse,io,math,zipfile
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import numpy as np
from scipy.spatial.transform import Rotation
from numba import njit
from make_game02_ganqiao_motion import load,get,add,glb,pixels,xform,repack,key

@njit
def relax(target,src,edges,mob):
 p=target.copy()
 for step in range(65):
  for k in range(len(edges)):
   a,b=edges[k]
   wa,wb=mob[a],mob[b]
   if wa+wb<1.e-6:continue
   x,y,z=p[a]-p[b];L=(x*x+y*y+z*z)**.5
   cur=src[k]
   if cur<.00001:continue
   hi=cur*1.28+.0003;lo=cur*.61
   if lo<=L<=hi or L<1.e-7:continue
   factor=.73*(L-(hi if L>hi else lo))/(L*(wa+wb))
   p[a,0]-=x*factor*wa;p[a,1]-=y*factor*wa;p[a,2]-=z*factor*wa
   p[b,0]+=x*factor*wb;p[b,1]+=y*factor*wb;p[b,2]+=z*factor*wb
  for i in range(len(p)):
   if mob[i]<=0:continue
   p[i]+=np.float32(.027*(1.-mob[i]))*(target[i]-p[i])
 return p

OPTS={'Idle':1.65,'Stride':.72,'Backstep':.86,'Throw':.95,'Flinch':.28,'Stagger':.85,'Fall':.80,
      'Emerge':.45,'KingWake':.45,'Stomp':.95,'Rush':1.5,'Call':.50}


def fit_sleeves(p, packed_ids, packed_weights, joints, lookup, idx):
    # The A-pose has a narrow gap between the rib cage and hanging sleeves.
    # Separate the regions before smoothing so lifting a hand does not pull a stripe off the chest.
    x,y,z=p.T; xx=np.abs(x)
    sm=lambda v,a,b: (lambda u:u*u*(3-2*u))(np.clip((v-a)/(b-a),0,1))
    cutoff=np.interp(y,[.355,.40,.46,.51,.55,.59,.625,.662,.70],[.124,.102,.100,.098,.088,.083,.083,.096,.114])
    arm=sm(xx,cutoff-.009,cutoff+.011)*sm(y,.353,.397)*(1-sm(y,.657,.711))
    jointids={name:joints.index(i) for name,i in lookup.items()}
    w=np.zeros((len(p),len(joints)),dtype=np.float32)
    for i in range(4):w[np.arange(len(p)),packed_ids[:,i]]+=packed_weights[:,i]
    for side in ('L','R'):
        for bone in ('_Arm','_Forearm','_Hand'):w[:,jointids[side+bone]]=0
    total=w.sum(1)
    w[total<.0005,jointids['Chest']]=1
    w=(w/w.sum(1,keepdims=True))*(1-arm).reshape(-1,1)
    elbow=1-sm(y,.520,.578);palm=1-sm(y,.463,.499)
    for side,d in [('L',1),('R',-1)]:
        blend=arm*(x*d>0)
        w[:,jointids[side+'_Arm']]=blend*(1-elbow)
        w[:,jointids[side+'_Forearm']]=blend*elbow*(1-palm)
        w[:,jointids[side+'_Hand']]=blend*elbow*palm
    _,imap=np.unique(np.round(p,5),axis=0,return_inverse=True)
    count=np.bincount(imap); acc=np.zeros((len(count),len(joints)),dtype=np.float32); np.add.at(acc,imap,w);acc/=count[:,None]
    f=imap[idx.reshape(-1,3)];ed=np.unique(np.sort(f[:,[0,1,1,2,2,0]].reshape(-1,2),axis=1),axis=0)
    ed=ed[ed[:,0]!=ed[:,1]]
    e0,e1=ed.T;ns=np.maximum(1,np.bincount(ed.ravel(),minlength=len(acc)))[:,None]
    w0=acc.copy()
    for _ in range(6):
        nk=np.zeros_like(acc)
        np.add.at(nk,e0,acc[e1]);np.add.at(nk,e1,acc[e0])
        acc=np.where(ns>1,.30*w0+.46*acc+.24*nk/ns,w0)
    w=acc[imap]
    ii=np.argsort(-w,axis=1)[:,:4].astype('<u2')
    ww=np.take_along_axis(w,ii,axis=1);ww=(ww/ww.sum(1,keepdims=True)).astype('<f4')
    assert np.isfinite(ww).all()
    return ii,ww

def bake(raw, out):
    j,b=load(raw); nodes=j['nodes']; skin=j['skins'][0]; joints=skin['joints']; lookup={nodes[k]['name']:k for k in joints}
    primitive=j['meshes'][0]['primitives'][0]; a=primitive['attributes']
    p,n,uv,ids,w=[get(j,b,a[k]) for k in ('POSITION','NORMAL','TEXCOORD_0','JOINTS_0','WEIGHTS_0')]
    idx=get(j,b,primitive['indices']).ravel().astype('int64'); assert len(p)<65536
    ib=get(j,b,skin['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1)
    v=j['bufferViews'][j['images'][0]['bufferView']]; start=v.get('byteOffset',0)
    tex=np.array(Image.open(io.BytesIO(b[start:start+v['byteLength']])).convert('RGB'))
    ids,w=fit_sleeves(p,ids,w,joints,lookup,idx)
    b,tex=repack(j,b,np.arange(len(p)),idx,p,n,uv,ids,w,ib,tex)
    loc=np.stack([xform(node) for node in nodes])
    parent={kid:par for par,node in enumerate(nodes) for kid in node.get('children',[])}
    def world(m):
        memo={}
        def f(i):
            if i not in memo:memo[i]=(f(parent[i])@m[i] if i in parent else m[i])
            return memo[i]
        return np.stack([f(i) for i in range(len(m))])
    def pose(m):
        matrices=(world(m)[joints]@ib)[ids]
        return ((np.einsum('nkij,nj->nki',matrices[:,:,:3,:3],p)+matrices[:,:,:3,3])*w[:,:,None]).sum(1)
    assert np.max(np.abs(pose(loc)-p))<.001
    h=np.ptp(p[:,1]); hips=lookup['Hips']
    def anim(clip,t):
        m=loc.copy()
        def rot(bone,axis,degrees):
            i=lookup[bone];m[i,:3,:3] = m[i,:3,:3] @ Rotation.from_euler(axis,degrees,degrees=True).as_matrix()
        def shift(axis,units):m[hips,'xyz'.index(axis),3]+=units*h
        sn=math.sin(math.tau*t);cs=math.cos(math.tau*t)
        pulse=lambda seq:key(t,np.linspace(0,1,len(seq)),seq)
        if clip=='Idle':
            rot('Chest','z',1.9*sn);rot('Head','y',5*sn);rot('R_Arm','z',6*(1-cs)/2)
        elif clip in ('Stride','Backstep','Rush'):
            if clip=='Rush':
                z=key(t,[0,.19,.405,7/15,.57,.91,1],[0,.45,1,1,.14,.07,0])
                go=key(t,[0,.44,7/15,.54,.94,1],[0,0,.24,1,1,.26])
                sn=math.sin(max(0,t-7/15)*math.tau*4.1)*go
                rot('Spine','x',12*z+12*go);rot('Head','x',-7*(z+go));shift('y',-.025*z); shift('z',.023*go)
                for side in 'LR':rot(side+'_Arm','x',17*go-21*z);rot(side+'_Forearm','x',-26*go)
            else:
                amp=1 if clip=='Stride' else -.68;sn*=amp
                rot('Spine','x',6 if clip=='Stride' else -5);rot('Chest','y',5*sn)
            shift('y',.018*sn*sn)
            for side,sign in [('L',1),('R',-1)]:
                cyc=sign*sn
                rot(side+'_Arm','x',-22*cyc);rot(side+'_Forearm','x',-8*max(0,-cyc))
                rot(side+'_Thigh','x',29*cyc);rot(side+'_Shin','x',24*max(0,-cyc))
                rot(side+'_Foot','x',-10*cyc)
        elif clip=='Throw':
            peak=.7/.95
            a=key(t,[0,.22,.48,.60,peak,.88,1],[0,.25,1,.94,0,0,0])
            b=key(t,[0,.49,.60,peak,.86,1],[0,0,.17,1,.60,0])
            rot('Chest','y',-15*a+20*b);rot('Spine','x',-10*a+14*b)
            rot('R_Arm','x',-26*a-68*b);rot('R_Arm','z',-12*a)
            rot('R_Forearm','x',-44*a-4*b);rot('R_Hand','x',13*b)
            rot('L_Arm','x',-24*a-20*b);rot('L_Forearm','x',-24*a)
            rot('Head','y',10*a-9*b);rot('R_Thigh','x',-11*b)
        elif clip=='Flinch':
            u=pulse([0,1,.56,.18,0]);rot('Spine','x',-19*u);rot('Head','x',-12*u)
            rot('R_Arm','z',-13*u);rot('L_Arm','z',13*u);shift('z',-.06*u)
        elif clip=='Stagger':
            rot('Spine','x',11);rot('Head','z',13*sn);rot('Chest','z',-6*sn);rot('R_Forearm','x',-17)
        elif clip=='Fall':
            u=key(t,[0,.19,.63,1],[0,.24,.88,1])
            rot('Hips','x',-76*u);rot('Head','x',14*u); rot('R_Arm','z',-25*u);rot('L_Arm','z',13*u)
            rot('R_Thigh','x',-14*u);rot('L_Shin','x',21*u)
            shift('y',-.35*u); floor=np.min(pose(m)[:,1]);m[hips,1,3]-=floor
        elif clip=='Emerge':
            d=key(t,[0,.25,.56,.73,1],[-.56,-.49,-.17,.035,0])
            u=pulse([.6,1,.70,.15,0])
            shift('y',d); rot('Spine','x',12*u);rot('Head','x',-10*u)
            rot('L_Arm','x',-48*u);rot('R_Arm','x',-48*u)
            rot('L_Forearm','x',-23*u);rot('R_Forearm','x',-23*u)
        elif clip=='KingWake':
            u=key(t,[0,.22,.48,.76,1],[1,1,.63,.15,0])
            brace=pulse([.1,.3,1,.61,0])
            rot('Hips','x',-83*u);rot('Spine','x',27*brace);rot('Head','x',15*u+9*brace)
            for side in 'LR':
                rot(side+'_Thigh','x',-29*brace);rot(side+'_Shin','x',41*brace)
                rot(side+'_Arm','x',-26*brace);rot(side+'_Forearm','x',-26*brace)
            floor=np.min(pose(m)[:,1]);m[hips,1,3]+=h*.125*u-floor
        elif clip=='Stomp':
            a=key(t,[0,.35,.69,.83,.96,1],[0,.62,1,.78,.1,0])
            b=key(t,[0,.65,.82,.97,1],[0,0,.19,.92,1])
            rot('Spine','x',-10*a+29*b);rot('Head','x',-14*a+12*b);shift('y',.037*a-.08*b)
            for side,s in [('L',1),('R',-1)]:
                rot(side+'_Arm','x',-78*a-30*b);rot(side+'_Arm','z',s*10*a)
                rot(side+'_Forearm','x',-22*a-8*b);rot(side+'_Thigh','x',-16*b);rot(side+'_Shin','x',30*b)
        elif clip=='Call':
            v=key(t,[0,.12,.33,.61,.85,1],[0,.28,1,1,.44,0]);rot('Chest','x',-13*v);rot('Head','x',-13*v)
            for side,s in [('L',1),('R',-1)]:
                rot(side+'_Arm','z',s*28*v);rot(side+'_Arm','x',-41*v);rot(side+'_Forearm','x',-23*v)
        if clip not in ('KingWake','Emerge','Fall'):
            floor=np.quantile(pose(m)[:,1],.0015)
            if floor<0:m[hips,1,3]-=floor
        return m

    j['animations']=[]
    out.mkdir(parents=True,exist_ok=True)
    panel=['Emerge','Throw','KingWake','Stomp','Rush','Call']
    chart=Image.new('RGB',(1120,155+len(panel)*191),'#eeedf2'); paint=ImageDraw.Draw(chart)
    fp=Path('C:/Windows/Fonts/msjhbd.ttc'); fp=str(fp) if fp.exists() else 'DejaVuSans.ttf'
    large=ImageFont.truetype(fp,34); label=ImageFont.truetype(fp,21)
    paint.text((28,22),'勇氣超人｜佛賴弟與佛賴弟王',font=large,fill='#1c1924')
    paint.text((29,70),'3D 動作分格 · 由遊戲 GLB 取樣',font=label,fill='#514855')
    cn={'Emerge':'小怪｜從地板冒出','Throw':'小怪｜遠程投擲','KingWake':'Boss｜從床上撐起（床架由遊戲另外繪製）',
        'Stomp':'Boss｜砸地','Rush':'Boss｜衝撞','Call':'Boss｜召喚'}
    unique,ix,inv=np.unique(np.round(p,5),axis=0,return_index=True,return_inverse=True)
    edges=np.unique(np.sort(inv[idx.reshape(-1,3)[:,[0,1,1,2,2,0]]].reshape(-1,2),axis=1),axis=0)
    lens=lambda v:np.linalg.norm(v[edges[:,0]]-v[edges[:,1]],axis=1)
    rest=lens(p[ix]);use=rest>.004
    hot={'Throw','Emerge','Stomp','Call'}
    samples={clip:np.linspace(0,1,25 if clip!='Rush' else 41) for clip in OPTS}
    deltas=[]; slots={}
    def skinlinear(m):
        linear=(world(m)[joints]@ib)[ids][:,:,:3,:3]
        return (linear*w[:,:,None,None]).sum(1)
    for clip in OPTS:
        if clip not in hot:continue
        slots[clip]=len(deltas)
        for t in samples[clip]:
            mat=anim(clip,t); pre=pose(mat)[ix]; rawlens=lens(pre)
            hit=(rawlens>rest*1.3+.0008)&(rawlens-rest>.002)
            mobile=np.zeros(len(ix),dtype=np.float32)
            mobile[edges[hit].ravel()]=.87
            mobile[(p[ix,1]>.77)|(p[ix,1]<.26)]=0
            fixed=relax(pre.astype(np.float32),rest,edges,mobile)
            diff=(fixed-pre)[inv]
            diff[np.linalg.norm(diff,axis=1)<.00012]=0
            d=(np.linalg.pinv(skinlinear(mat))@diff[:,:,None])[:,:,0]
            deltas.append(d.astype('<f4'))
    A=np.stack(deltas).reshape(len(deltas),-1)
    ev,V=np.linalg.eigh(A@A.T)
    take=np.flatnonzero(ev>1e-8)[-10:]
    basis=((V[:,take].T@A)/np.sqrt(ev[take,None])).reshape(len(take),len(p),3).astype('<f4')
    co=(V[:,take]*np.sqrt(ev[take])).astype('<f4')
    # Sparse mesh-space correctives control the patterned sleeve and elbow seams.
    primitive['targets']=[]
    for morph in basis:
        keep=np.flatnonzero(np.linalg.norm(morph,axis=1)>.0007)
        mask=np.zeros(len(p),dtype=bool);mask[keep]=True;morph[~mask]=0
        ids0=add(j,b,keep.astype('<u2'),'SCALAR')
        val=add(j,b,morph[keep],'VEC3'); n0=len(j['accessors'])
        j['accessors'].append(dict(componentType=5126,count=len(p),type='VEC3',
            min=np.minimum(morph.min(0),0).tolist(),max=np.maximum(morph.max(0),0).tolist(),
            sparse=dict(count=len(keep),indices=dict(bufferView=j['accessors'][ids0]['bufferView'],componentType=5123),
                        values=dict(bufferView=j['accessors'][val]['bufferView']))))
        primitive['targets'].append(dict(POSITION=n0))
    j['meshes'][0]['weights']=[0]*len(basis)
    target=next(i for i,node in enumerate(nodes) if node.get('mesh')==0 and 'skin' in node)
    for clip,dur in OPTS.items():
        times=samples[clip]
        mats=np.stack([anim(clip,t) for t in times])
        ia=add(j,b,(times*dur).astype('<f4'),'SCALAR',limits=True)
        samplers=[];channels=[]
        def track(node,attr,arr,typ):
            oa=add(j,b,np.asarray(arr,dtype='<f4'),typ)
            samplers.append(dict(input=ia,output=oa,interpolation='LINEAR'))
            channels.append(dict(sampler=len(samplers)-1,target=dict(node=node,path=attr)))
        for node in joints:
            if np.max(np.abs(mats[:,node,:3,:3]-loc[node,:3,:3]))>1e-5:
                q=Rotation.from_matrix(mats[:,node,:3,:3]).as_quat()
                for k in range(1,len(q)):
                    if q[k]@q[k-1]<0:q[k]*=-1
                track(node,'rotation',q,'VEC4')
            if np.max(np.abs(mats[:,node,:3,3]-loc[node,:3,3]))>1e-5:
                track(node,'translation',mats[:,node,:3,3],'VEC3')
        coeff=co[slots[clip]:slots[clip]+len(times)] if clip in slots else np.zeros((len(times),len(basis)),dtype='<f4')
        if clip in slots:track(target,'weights',coeff.ravel(),'SCALAR')
        j['animations'].append(dict(name=clip,channels=channels,samplers=samplers))
        def corrected(mat,weights):
            posed=pose(mat)
            if clip not in slots:return posed
            d=np.tensordot(weights,basis,axes=1)
            return posed+(skinlinear(mat)@d[:,:,None])[:,:,0]
        metrics=[]
        for mat,wt in zip(mats,coeff):
            mesh=corrected(mat,wt);ln=lens(mesh[ix]);metrics.append([np.quantile(ln[use]/rest[use],.995),float(np.min(mesh[:,1]))])
        print(clip,'stretch p99.5',round(max(x[0] for x in metrics),3),'floor',round(min(x[1] for x in metrics),3),flush=True)
        if clip not in panel:continue
        row=panel.index(clip); yy=118+row*191
        paint.text((30,yy),cn[clip],font=label,fill='#1c1924')
        at=[0,.25,.60,1] if clip in ('Emerge','KingWake','Stomp') else [0,.40,.738,.94]
        ang=.85
        c,s=np.cos(ang),np.sin(ang)
        for col,t in enumerate(at):
            wt=np.array([np.interp(t,times,coeff[:,k]) for k in range(len(basis))]);pts=corrected(anim(clip,t),wt).astype(np.float32)
            if clip=='Emerge':
                # Clip at the ground for this review sheet, as the in-game stage floor does.
                pts[pts[:,1]<0,1]=-.004
            pts=pts@np.float32([[c,0,s],[0,1,0],[-s,0,c]]).T
            pts[:,0]=pts[:,0]*132+130;pts[:,1]=139-pts[:,1]*135
            frame=Image.fromarray(pixels(pts*2,idx,uv,tex,520,316)).resize((260,158),Image.Resampling.LANCZOS)
            chart.paste(frame,(32+266*col,yy+29))
    (out/'brave_guy_charactor05_folaidi_motion.glb').write_bytes(glb(j,b))
    chart.save(out/'BraveGuy_Folaidi_3D_Motion_QA.jpg',quality=92,optimize=True)
    print(len(p),len(idx)//3,'original vertices and triangles retained')

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--rig-zip',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    a=p.parse_args()
    with zipfile.ZipFile(a.rig_zip) as z:bake(z.read('GLB/folaidi_rig.glb'),a.output)
