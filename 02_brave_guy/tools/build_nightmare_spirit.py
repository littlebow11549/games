"""Bake the real Tripo Nightmare costume/face into the low-overhead skill spirit GLB.
Run from the repo root: python 02_brave_guy/tools/build_nightmare_spirit.py
Requires numpy and Pillow. Body is static; wing/bob animation lives in the game.
"""
import io
import json
import struct
from pathlib import Path

import numpy as np
from PIL import Image

ART = Path(__file__).resolve().parents[1] / 'assets/runtime/stage-art'
source = (ART / 'brave_guy_charactor03_nightmare_motion.glb').read_bytes()
length = struct.unpack_from('<I', source, 12)[0]
doc = json.loads(source[20:20+length])
binary = source[28+length:]
prim = doc['meshes'][0]['primitives'][0]

def read_accessor(index):
    a = doc['accessors'][index]
    v = doc['bufferViews'][a['bufferView']]
    t = {5126:'<f4',5125:'<u4',5123:'<u2'}[a['componentType']]
    w = {'SCALAR':1,'VEC2':2,'VEC3':3}[a['type']]
    d = np.dtype(t)
    return np.ndarray((a['count'],w),dtype=d,buffer=binary,
                      offset=v.get('byteOffset',0)+a.get('byteOffset',0),
                      strides=(v.get('byteStride',w*d.itemsize),d.itemsize)).copy()

p = read_accessor(prim['attributes']['POSITION'])
uv = read_accessor(prim['attributes']['TEXCOORD_0'])
original_normals = read_accessor(prim['attributes']['NORMAL'])
indices = read_accessor(prim['indices']).astype('<u2').reshape(-1,3)
y = p[:,1].copy()
# Thicken boots and body, shorten legs, enlarge the face without recoloring hair/scarf.
# A smooth neck transition keeps the original outfit silhouette and UVs intact.
w = np.clip((y-.701)/.128,0,1)
w = w*w*(3-2*w)
p[:,0] *= 1.07+.49*w
p[:,2] = .055+(p[:,2]-.055)*(1.01+.31*w)
p[:,1] = y-.154*np.minimum(y,.52)/.52 + .48*np.maximum(y-.742,0)*w
p *= 1.50
# Recompute the transformed normals by applying the local inverse-transpose
# Jacobian, preserving the authored smoothing across UV seams.
sx = 1.07+.49*w
sz = 1.01+.31*w
u = np.clip((y-.701)/.128,0,1)
dw = 6*u*(1-u)/.128
dy = 1-.154/.52*(y<.52)+.48*(y>.742)*(w+np.maximum(y-.742,0)*dw)
nx = original_normals[:,0]/sx
nz = original_normals[:,2]/sz
ny = (original_normals[:,1]-.49*dw*p[:,0]/(1.50*sx)*nx-.31*dw*(p[:,2]/1.50-.055)/sz*nz)/dy
normals = np.column_stack([nx,ny,nz])
normals /= np.maximum(1e-9,np.linalg.norm(normals,axis=1))[:,None]
tex_view = doc['bufferViews'][doc['images'][0]['bufferView']]
offset = tex_view.get('byteOffset',0)
texture = Image.open(io.BytesIO(binary[offset:offset+tex_view['byteLength']])).convert('RGB')
texture.thumbnail((512,512),Image.Resampling.LANCZOS)
tex = io.BytesIO()
texture.save(tex,format='JPEG',quality=87,optimize=True)
output = bytearray()
views,accessors = [],[]
def add_view(data,target=None):
    output.extend(b'\x00'*(-len(output)%4))
    v={'buffer':0,'byteOffset':len(output),'byteLength':len(data)}
    if target: v['target']=target
    output.extend(data)
    views.append(v)
    return len(views)-1

def add_accessor(data,typ,comp,target,limits=False):
    a={'bufferView':add_view(data.tobytes(),target),'componentType':comp,
       'count':len(data),'type':typ}
    if limits:
        a.update(min=data.min(axis=0).tolist(),max=data.max(axis=0).tolist())
    accessors.append(a)
    return len(accessors)-1

body = {'attributes':{
    'POSITION':add_accessor(p.astype('<f4'),'VEC3',5126,34962,True),
    'NORMAL':add_accessor(normals.astype('<f4'),'VEC3',5126,34962),
    'TEXCOORD_0':add_accessor(uv.astype('<f4'),'VEC2',5126,34962),
},'indices':add_accessor(indices.ravel(),'SCALAR',5123,34963),'material':0}
img = add_view(tex.getvalue())
output.extend(b'\x00'*(-len(output)%4))
gltf={'asset':{'version':'2.0','generator':'Brave Guy Tripo-derived spirit bake'},
      'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'name':'Nightmare chibi spirit body','mesh':0}],
      'meshes':[{'primitives':[body]}],'extensionsUsed':['KHR_materials_unlit'],
      'materials':[{'name':'Original Nightmare colors','pbrMetallicRoughness':{'baseColorTexture':{'index':0}},
                    'extensions':{'KHR_materials_unlit':{}}}],
      'textures':[{'source':0}], 'images':[{'bufferView':img,'mimeType':'image/jpeg'}],
      'buffers':[{'byteLength':len(output)}],'bufferViews':views,'accessors':accessors}
j = json.dumps(gltf,separators=(',',':')).encode()
j += b' '*(-len(j)%4)
data = struct.pack('<4sIIII',b'glTF',2,28+len(j)+len(output),len(j),0x4e4f534a)+j
data += struct.pack('<II',len(output),0x004e4942)+output
dest=ART/'brave_guy_charactor03_nightmare_spirit.glb'
dest.write_bytes(data)
print(dest.name, len(data), 'bytes,',len(p),'vertices')
