"""Reduce the crowd rig without merging texture seams or changing animation timing."""
import argparse
import heapq
import io
from pathlib import Path
import numpy as np
from PIL import Image
from make_game02_ganqiao_motion import add, get, glb, load, repack

def simplify(p,uv,n,faces,w,ids,joint_count,target):
    # Each boundary and UV seam remains where it was. Interior collapses snap to an endpoint.
    _,ident,npos=np.unique(np.round(p,6),axis=0,return_inverse=True,return_counts=True)
    edges=np.sort(faces[:,[0,1,1,2,2,0]].reshape(-1,2),axis=1)
    edges,counts=np.unique(edges,axis=0,return_counts=True)
    locked=npos[ident]>1
    locked[edges[counts!=2].ravel()]=True
    influences=np.zeros((len(p),joint_count),dtype=np.float32)
    np.add.at(influences,(np.broadcast_to(np.arange(len(p))[:,None],ids.shape),ids),w)
    adj=[set() for _ in p]
    for i,f in enumerate(faces):
        for v in f:adj[v].add(i)
    e=p[faces[:,1]]-p[faces[:,0]];f=p[faces[:,2]]-p[faces[:,0]]
    normal=np.cross(e,f);norm=np.linalg.norm(normal,axis=1)
    normal/=np.maximum(norm[:,None],1e-10)
    plane=np.column_stack((normal,-(normal*p[faces[:,0]]).sum(1)))
    quadrics=np.zeros((len(p),4,4))
    q=plane[:,:,None]*plane[:,None,:]
    for i in range(3):np.add.at(quadrics,faces[:,i],q)
    hp=np.column_stack((p,np.ones(len(p))))
    current=faces.copy()
    stamp=np.zeros(len(p),dtype='int32')
    queue=[]
    def push(a,b):
        if a==b or locked[a] and locked[b]:return
        if a>b:a,b=b,a
        ea=hp[a]@(quadrics[a]+quadrics[b])@hp[a] if not locked[b] else np.inf
        eb=hp[b]@(quadrics[a]+quadrics[b])@hp[b] if not locked[a] else np.inf
        lo,hi=(a,b) if ea<=eb else (b,a)
        skin=.002*np.square(influences[a]-influences[b]).sum()
        uv_penalty=.003*np.square(uv[a]-uv[b]).sum()
        edge_penalty=.001*np.square(p[a]-p[b]).sum()
        heapq.heappush(queue,(min(ea,eb)+skin+uv_penalty+edge_penalty,lo,hi,stamp[lo],stamp[hi]))
    for a,b in edges:push(a,b)
    remain=len(faces)
    while queue and remain>target:
        _,lo,hi,lv,hv=heapq.heappop(queue)
        if stamp[lo]!=lv or stamp[hi]!=hv or not adj[lo] or not adj[hi]:continue
        overlap=adj[lo]&adj[hi]
        if len(overlap)!=2:continue
        neighbors=lambda i:set(current[list(adj[i])].ravel())-{i}
        if neighbors(lo)&neighbors(hi)!=set(current[list(overlap)].ravel())-{lo,hi}:continue
        touched=list(adj[hi]-overlap)
        before=current[touched];after=np.where(before==hi,lo,before)
        a,b,c=p[after[:,0]],p[after[:,1]],p[after[:,2]]
        qn=np.cross(b-a,c-a)
        qlen=np.linalg.norm(qn,axis=1)
        if (qlen<1e-8).any() or ((qn*normal[touched]).sum(1)<qlen*.15).any():continue
        for face in overlap:
            for v in current[face]:adj[v].discard(face)
            current[face]=-1
        current[touched]=after
        adj[lo].update(touched);adj[hi].clear()
        stamp[hi]+=1;stamp[lo]+=1;quadrics[lo]+=quadrics[hi];remain-=2
        for v in sorted(neighbors(lo)):push(lo,v)
    current=current[current[:,0]>=0]
    selected=np.unique(current);index=np.zeros(len(p),dtype=np.int32);index[selected]=np.arange(len(selected))
    return selected,index[current].ravel()

def crowd(raw,target):
    j,b=load(raw);pr=j['meshes'][0]['primitives'][0];a=pr['attributes']
    p,n,uv,ids,w=[get(j,b,a[key]) for key in ('POSITION','NORMAL','TEXCOORD_0','JOINTS_0','WEIGHTS_0')]
    faces=get(j,b,pr['indices']).reshape(-1,3).astype('int32')
    ib=get(j,b,j['skins'][0]['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1)
    v=j['bufferViews'][j['images'][0]['bufferView']];o=v.get('byteOffset',0)
    im=Image.open(io.BytesIO(b[o:o+v['byteLength']])).convert('RGB')
    # Crowd version skips corrective morph buffers and king-only clips. Hand, face and hat UVs are retained.
    im.thumbnail((512,512),Image.Resampling.LANCZOS)
    selected,index=simplify(p,uv,n,faces,w,ids,len(j['skins'][0]['joints']),target)
    print('Crowd triangles:',len(faces),'->',len(index)//3,flush=True)
    tracks={}
    for anim in j['animations']:
        if anim['name'] not in ('Idle','Run','Attack','Hit','Fall'):continue
        parts=[]
        for channel in anim['channels']:
            if channel['target']['path']=='weights':continue
            s=anim['samplers'][channel['sampler']]
            parts.append((channel['target'],get(j,b,s['input']),get(j,b,s['output'])))
        tracks[anim['name']]=parts
    pr.pop('targets',None);j['meshes'][0].pop('weights',None)
    b,_=repack(j,b,selected,index,p,n,uv,ids,w,ib,np.array(im))
    j['animations']=[]
    for name,parts in tracks.items():
        ts=add(j,b,parts[0][1].astype('<f4'),'SCALAR',limits=True)
        anim=dict(name=name,channels=[],samplers=[])
        for target,_,val in parts:
            o=add(j,b,val.astype('<f4'),f'VEC{val.shape[1]}')
            anim['channels'].append(dict(sampler=len(anim['samplers']),target=target))
            anim['samplers'].append(dict(input=ts,output=o,interpolation='LINEAR'))
        j['animations'].append(anim)
    return glb(j,b)

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('source',type=Path);p.add_argument('output',type=Path);p.add_argument('--triangles',type=int,default=3000)
    a=p.parse_args();a.output.write_bytes(crowd(a.source.read_bytes(),a.triangles))
