"""Build a light game-ready shoulder rig from one exported Tripo multiview GLB."""
import argparse
import io
import hashlib
from pathlib import Path
import numpy as np
from PIL import Image
from make_game02_ganqiao_motion import add,get,glb,load
from make_game02_kaban_lod import simplify

def smooth(lo,hi,x):
    k=np.clip((x-lo)/(hi-lo),0,1)
    return k*k*(3-2*k)

def build(raw,role,source_id,front=1):
    src,b=load(raw)
    pr=src['meshes'][0]['primitives'][0]
    a=pr['attributes']
    p,n,uv=[get(src,b,a[k]) for k in ('POSITION','NORMAL','TEXCOORD_0')]
    faces=get(src,b,pr['indices']).reshape(-1,3).astype('int32')
    # Weight only visible outer rear fins. Smooth falloff locks the neck, cape,
    # arms, wing bases and all lower limbs to the body joint.
    if front<0:
        p=p.copy(); n=n.copy()
        p[:,[0,2]]*=-1; n[:,[0,2]]*=-1
    x,y,z=p.T
    wing=smooth(.146,.30,np.abs(x))*smooth(.03,.115,-z)*smooth(.405,.51,y)*(1-smooth(.705,.79,y))
    joints=np.zeros((len(p),4),dtype='<u2');joints[:,1]=np.where(x<0,1,2)
    weights=np.zeros((len(p),4),dtype='<f4');weights[:,0]=1-wing;weights[:,1]=wing
    selected,inds=simplify(p,uv,n,faces,weights,joints,3,7900)
    j={'asset':{'version':'2.0','generator':'Brave Guy | Tripo spirit mobile package'},
       'extras':{'tripoAsset':source_id,'sourceSha256':hashlib.sha256(raw).hexdigest(),'role':role},
       'extensionsUsed':['KHR_materials_unlit'],
       'buffers':[{'byteLength':0}],'bufferViews':[],'accessors':[],'scene':0,
       'scenes':[{'nodes':[0,1]}],
       'nodes':[{'name':role,'mesh':0,'skin':0},{'name':'Body','children':[2,3]},
                {'name':'Wing_L','translation':[-.129,.563,-.103]},
                {'name':'Wing_R','translation':[.129,.563,-.103]}],
       'skins':[{'skeleton':1,'joints':[1,2,3]}],
       'materials':[{'extensions':{'KHR_materials_unlit':{}},'pbrMetallicRoughness':{'baseColorTexture':{'index':0},'metallicFactor':0,'roughnessFactor':1}}],
       'textures':[{'source':0,'sampler':0}],'samplers':[{'magFilter':9729,'minFilter':9987,'wrapS':33071,'wrapT':33071}]}
    out=bytearray()
    attrs={k:add(j,out,v[selected].astype(dtype),t,34962,limits=k=='POSITION') for k,v,dtype,t in (
        ('POSITION',p,'<f4','VEC3'),('NORMAL',n,'<f4','VEC3'),('TEXCOORD_0',uv,'<f4','VEC2'),
        ('JOINTS_0',joints,'<u2','VEC4'),('WEIGHTS_0',weights,'<f4','VEC4'))}
    j['meshes']=[{'name':role,'primitives':[{'attributes':attrs,'indices':add(j,out,inds.astype('<u2'),'SCALAR',34963),'material':0}]}]
    ib=np.repeat(np.eye(4,dtype='<f4')[None],3,axis=0)
    for i in (1,2):
        ib[i,3,:3]=-np.array(j['nodes'][i+1]['translation'])
    j['skins'][0]['inverseBindMatrices']=add(j,out,ib.reshape(3,16),'MAT4')

    view=src['bufferViews'][src['images'][0]['bufferView']]
    o=view.get('byteOffset',0)
    texture=Image.open(io.BytesIO(b[o:o+view['byteLength']])).convert('RGB')
    texture.thumbnail((768,768),Image.Resampling.LANCZOS)
    coded=io.BytesIO();texture.save(coded,format='PNG',optimize=True)
    out.extend(b'\0'*(-len(out)%4))
    j['images']=[{'bufferView':len(j['bufferViews']),'mimeType':'image/png'}]
    j['bufferViews'].append({'buffer':0,'byteOffset':len(out),'byteLength':len(coded.getvalue())})
    out.extend(coded.getvalue())

    a={'name':'Spirit_Hover','channels':[],'samplers':[]}
    times=np.linspace(0,1.5,13,dtype='<f4')
    t=add(j,out,times,'SCALAR',limits=True)
    for i in (0,1,2):
        ax=2 if not i else 1
        amp=.055 if not i else .25*(-1 if i==1 else 1)
        ang=amp*np.sin(times*4*np.pi/1.5 if i else times*2*np.pi/1.5)
        q=np.zeros((len(times),4),dtype='<f4')
        q[:,ax]=np.sin(ang/2); q[:,3]=np.cos(ang/2)
        out_id=add(j,out,q,'VEC4')
        a['channels'].append({'sampler':i,'target':{'node':i+1,'path':'rotation'}})
        a['samplers'].append({'input':t,'output':out_id,'interpolation':'LINEAR'})
    j['animations']=[a]
    print(f'{role}: {len(faces)} -> {len(inds)//3} triangles; {len(selected)} vertices / {int((wing[selected]>.3).sum())} strong wing weights; {texture.size}')
    return glb(j,out)

if __name__=='__main__':
    arg=argparse.ArgumentParser(description=__doc__)
    arg.add_argument('source',type=Path);arg.add_argument('output',type=Path)
    arg.add_argument('role');arg.add_argument('source_id');arg.add_argument('--front',type=int,choices=[-1,1],default=1)
    a=arg.parse_args()
    a.output.write_bytes(build(a.source.read_bytes(),a.role,a.source_id,a.front))
    print(a.output.stat().st_size,'bytes')
