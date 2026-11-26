"""Bake combat motion for the existing school Jiasen and office Jiamang rigs."""
import argparse,io,math,zipfile
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import numpy as np
from scipy.spatial.transform import Rotation
from make_game02_folaidi_motion import relax
from make_game02_ganqiao_motion import load,get,add,glb,pixels,xform,repack,key

MOTIONS={'Idle':1.64,'Stride':.69,'Strike':1,'Flinch':.28,'Stagger':.87,'Fall':.78}
OFFICE={'Backstep':.82,'Stomp':.95,'Rush':1.50,'Call':.50}

def fitted_rig(nodes,joints,lookup,p,idx,ids,w,office):
    # Locate pivots inside the plush silhouette, not at a human shoulder above the neck.
    parent={kid:par for par,node in enumerate(nodes) for kid in node.get('children',[])}
    def matrix_all(local):
        memo={}
        def f(i):
            if i not in memo:memo[i]=f(parent[i])@local[i] if i in parent else local[i]
            return memo[i]
        return np.stack([f(i) for i in range(len(local))])
    absrest=matrix_all(np.stack([xform(n) for n in nodes]))
    absnew=absrest.copy(); z=.025 if office else .035
    for key,x_,y_,z_ in [('Spine',0,.417,z),('Chest',0,.521,z),('Neck',0,.59,z),('Head',0,.646,z+.008)]:
        absnew[lookup[key],:3,3]=[x_,y_,z_]
    for side,sg in [('L',1),('R',-1)]:
        for suffix,x_,y_,z_ in [('Arm',.118,.552,z),('Forearm',.197,.449,z),('Hand',.241,.362,z+.004)]:
            absnew[lookup[side+'_'+suffix],:3,3]=[sg*x_,y_,z_]
    for i in joints:
        local=np.linalg.solve(absnew[parent[i]],absnew[i]) if i in parent else absnew[i]
        nodes[i]['translation']=local[:3,3].tolist()
    inverse=np.linalg.inv(absnew[joints])
    lookup={k:joints.index(v) for k,v in lookup.items()}
    full=np.zeros((len(p),len(joints)),dtype=np.float32)
    for i in range(4):full[np.arange(len(p)),ids[:,i]]+=w[:,i]
    for key in ('Head','Neck','L_Arm','L_Forearm','L_Hand','R_Arm','R_Forearm','R_Hand'):
        full[:,lookup[key]]=0
    x,y,z=p.T
    def smooth(v,lo,hi):
        s=np.clip((v-lo)/(hi-lo),0,1);return s*s*(3-2*s)
    boundary=np.interp(y,[.25,.28,.34,.4,.44,.48,.52,.56,.595],[.208,.188,.187,.18,.171,.158,.133,.114,.114])
    head=smooth(y,.57,.623);arm=smooth(np.abs(x),boundary-.012,boundary+.012)*smooth(y,.242,.275)*(1-smooth(y,.545,.592))
    arm*=1-head
    elbow=1-smooth(y,.422,.477);hand=1-smooth(y,.344,.389)
    strength=full.sum(1)
    full[strength<.00005,lookup['Chest']]=1
    full*=((1-arm-head)/full.sum(1))[:,None]
    full[:,lookup['Head']]=head
    for side,sg in [('L',1),('R',-1)]:
        v=arm*(x*sg>0)
        full[:,lookup[side+'_Arm']]=v*(1-elbow)
        full[:,lookup[side+'_Forearm']]=v*elbow*(1-hand)
        full[:,lookup[side+'_Hand']]=v*elbow*hand
    _,vi=np.unique(np.round(p,5),axis=0,return_inverse=True)
    weights=np.zeros((int(vi.max())+1,len(joints)),dtype=np.float32)
    np.add.at(weights,vi,full);weights/=np.bincount(vi)[:,None]
    faces=vi[idx.reshape(-1,3)]
    ed=np.unique(np.sort(faces[:,[0,1,1,2,2,0]].reshape(-1,2),axis=1),axis=0);a,b=ed[ed[:,0]!=ed[:,1]].T
    ns=np.maximum(1,np.bincount(ed[ed[:,0]!=ed[:,1]].ravel(),minlength=len(weights)))[:,None]
    seed=weights.copy()
    for _ in range(6):
        spread=np.zeros_like(weights);np.add.at(spread,a,weights[b]);np.add.at(spread,b,weights[a])
        weights=.38*seed+.42*weights+.20*np.where(ns>1,spread/ns,seed)
    weights=weights[vi]
    jid=np.argsort(-weights,axis=1)[:,:4].astype('<u2')
    w=np.take_along_axis(weights,jid,axis=1);w=(w/w.sum(1,keepdims=True)).astype('<f4')
    return jid,w,inverse

def bake(role,raw,out):
    office=role=='jiamang'; opts=dict(MOTIONS,**(OFFICE if office else {}));opts['Strike']=1.05 if office else 1.
    j,b=load(raw); nodes=j['nodes']; skin=j['skins'][0]; joints=skin['joints']; lookup={nodes[k]['name']:k for k in joints}
    primitive=j['meshes'][0]['primitives'][0]; a=primitive['attributes']
    p,n,uv,ids,w=[get(j,b,a[k]) for k in ('POSITION','NORMAL','TEXCOORD_0','JOINTS_0','WEIGHTS_0')]
    idx=get(j,b,primitive['indices']).ravel().astype('int64'); assert len(p)<65536
    ib=get(j,b,skin['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1)
    v=j['bufferViews'][j['images'][0]['bufferView']]; start=v.get('byteOffset',0)
    tex=np.array(Image.open(io.BytesIO(b[start:start+v['byteLength']])).convert('RGB'))
    ids,w,ib=fitted_rig(nodes,joints,lookup,p,idx,ids,w,office)
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
            rot('Chest','z',2.5*sn);rot('Head','y',(4 if office else 7)*sn)
            rot('R_Forearm','x',-8-4*sn);rot('L_Forearm','x',-8+3*sn)
            if not office:rot('Head','z',2.6*math.sin(t*4*math.tau))
        elif clip in ('Stride','Backstep','Rush'):
            if clip=='Rush':
                lean=key(t,[0,.2,.4667,.55,.90,1],[0,.45,1,1,.87,0])
                go=key(t,[0,.45,.51,.72,1],[0,0,1,1,.4])
                sn=go*math.sin(max(0,t-.4667)*math.tau*4.2)
                rot('Spine','x',18*lean);rot('Head','x',-13*lean);shift('z',.034*go);shift('y',-.044*lean)
            else:
                sn*=1 if clip=='Stride' else -.67
                rot('Spine','x',8 if clip=='Stride' else -6);rot('Chest','y',6*sn)
            shift('y',.024*sn*sn)
            for side,sgn in [('L',1),('R',-1)]:
                v=sgn*sn;rot(side+'_Arm','x',-15*v);rot(side+'_Forearm','x',-11*max(0,-v))
                rot(side+'_Thigh','x',19*v);rot(side+'_Shin','x',17*max(0,-v));rot(side+'_Foot','x',-10*v)
        elif clip=='Strike':
            peak=.8/1.05 if office else .75
            a=key(t,[0,.18,.49,.61,peak,1],[0,.26,1,.93,0,0])
            b=key(t,[0,.48,.59,peak,.87,1],[0,0,.20,1,.62,0])
            rot('Chest','y',(-17 if office else -23)*a+26*b)
            rot('Spine','x',-6*a+13*b);rot('Head','y',11*a-11*b);shift('z',.058*b)
            rot('R_Arm','x',(-29 if office else 13)*a-41*b)
            rot('R_Arm','z',5*a+4*b);rot('R_Arm','y',31*b-13*a);rot('R_Forearm','x',-28*a-13*b)
            rot('R_Hand','x',20*b);rot('L_Arm','x',-15*a+11*b)
            rot('L_Forearm','x',-18*a);rot('R_Thigh','x',-15*b)
        elif clip=='Flinch':
            u=pulse([0,1,.52,.19,0]);rot('Spine','x',-17*u);rot('Head','x',-11*u)
            rot('R_Arm','z',-10*u);rot('L_Arm','z',10*u);shift('z',-.053*u)
        elif clip=='Stagger':
            rot('Spine','x',10);rot('Head','z',13*sn);rot('Chest','z',-6*sn);rot('R_Forearm','x',-15)
        elif clip=='Fall':
            u=key(t,[0,.19,.63,1],[0,.24,.88,1])
            rot('Hips','z',-69*u);rot('Hips','x',-20*u);rot('Head','z',12*u)
            rot('R_Arm','z',-14*u);rot('L_Arm','z',13*u);rot('L_Shin','x',19*u)
            shift('y',-.29*u);m[hips,1,3]-=np.min(pose(m)[:,1])
        elif clip=='Stomp':
            a=key(t,[0,.25,.60,.82,.96,1],[0,.59,1,.78,.14,0])
            b=key(t,[0,.67,.83,.98,1],[0,0,.22,.94,1])
            rot('Spine','x',-11*a+27*b);rot('Head','x',-10*a+12*b);shift('y',.038*a-.073*b)
            for side,sgn in [('L',1),('R',-1)]:
                rot(side+'_Arm','x',-50*a-22*b);rot(side+'_Arm','z',sgn*6*a)
                rot(side+'_Arm','y',-sgn*(22*a+12*b));rot(side+'_Forearm','x',-15*a-7*b);rot(side+'_Thigh','x',-16*b);rot(side+'_Shin','x',27*b)
        elif clip=='Call':
            v=key(t,[0,.12,.32,.62,.85,1],[0,.24,1,1,.42,0])
            rot('Chest','x',-10*v);rot('Head','x',-10*v)
            rot('R_Arm','x',-44*v);rot('R_Arm','y',26*v);rot('R_Forearm','x',-15*v)
            rot('L_Arm','z',16*v);rot('L_Forearm','x',-33*v)
        if clip!='Fall':
            floor=np.quantile(pose(m)[:,1],.0015)
            if floor<0:m[hips,1,3]-=floor
        return m

    j['animations']=[]
    out.mkdir(parents=True,exist_ok=True)
    panel=['Strike','Stomp','Rush','Call'] if office else ['Strike','Stride','Flinch','Fall']
    chart=Image.new('RGB',(1120,130+len(panel)*196),'#eeedf2');paint=ImageDraw.Draw(chart)
    fp=Path('C:/Windows/Fonts/msjhbd.ttc');fp=str(fp) if fp.exists() else 'DejaVuSans.ttf'
    large=ImageFont.truetype(fp,34);label=ImageFont.truetype(fp,21)
    paint.text((28,22),'勇氣超人｜假忙森與主管' if office else '勇氣超人｜校園假森',font=large,fill='#1c1924')
    paint.text((29,70),'3D 動作分格 · 由遊戲 GLB 取樣',font=label,fill='#514855')
    cn={'Strike':'小怪｜甩鍋（平底鍋由遊戲另行繪製）' if office else '小怪｜近身揮拳',
        'Stride':'追擊','Flinch':'受擊','Fall':'倒地','Stomp':'主管｜砸地','Rush':'主管｜衝撞','Call':'主管｜召喚'}
    unique,ix,inv=np.unique(np.round(p,5),axis=0,return_index=True,return_inverse=True)
    edges=np.unique(np.sort(inv[idx.reshape(-1,3)[:,[0,1,1,2,2,0]]].reshape(-1,2),axis=1),axis=0)
    lens=lambda v:np.linalg.norm(v[edges[:,0]]-v[edges[:,1]],axis=1)
    rest=lens(p[ix]);use=rest>.004
    hot={'Stride','Strike','Stomp','Call','Rush'}
    samples={clip:np.linspace(0,1,25 if clip!='Rush' else 41) for clip in opts}
    deltas=[]; slots={}
    def skinlinear(m):
        linear=(world(m)[joints]@ib)[ids][:,:,:3,:3]
        return (linear*w[:,:,None,None]).sum(1)
    for clip in opts:
        if clip not in hot:continue
        slots[clip]=len(deltas)
        for t in samples[clip]:
            mat=anim(clip,t); pre=pose(mat)[ix]; rawlens=lens(pre)
            hit=(rawlens>rest*1.3+.0008)&(rawlens-rest>.002)
            mobile=np.zeros(len(ix),dtype=np.float32)
            mobile[edges[hit].ravel()]=.87
            mobile[(p[ix,1]>.60)|(p[ix,1]<.238)]=0
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
    for clip,dur in opts.items():
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
        at=[0,.41,.75,.84] if clip!='Fall' else [0,.39,.72,1]
        ang=-.73
        c,s=np.cos(ang),np.sin(ang)
        for col,t in enumerate(at):
            wt=np.array([np.interp(t,times,coeff[:,k]) for k in range(len(basis))]);pts=corrected(anim(clip,t),wt).astype(np.float32)
            pts=pts@np.float32([[c,0,s],[0,1,0],[-s,0,c]]).T
            pts[:,0]=pts[:,0]*132+130;pts[:,1]=139-pts[:,1]*135
            frame=Image.fromarray(pixels(pts*2,idx,uv,tex,520,316)).resize((260,158),Image.Resampling.LANCZOS)
            chart.paste(frame,(32+266*col,yy+29))
    actor='17' if office else '08'
    (out/f'brave_guy_charactor{actor}_{role}_motion.glb').write_bytes(glb(j,b))
    chart.save(out/f'BraveGuy_{role}_Motion_QA.jpg',quality=92,optimize=True)
    print(len(p),len(idx)//3,'original vertices and triangles retained')

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--rig-zip',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    a=p.parse_args()
    with zipfile.ZipFile(a.rig_zip) as z:
        for role in ('jiasen','jiamang'):bake(role,z.read(f'GLB/{role}_rig.glb'),a.output)
