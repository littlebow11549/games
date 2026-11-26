"""勇氣超人 / 幹譙龍三型態. Uses NumPy, SciPy, Numba and Pillow. Artwork sources and rollback: docs/handoffs/2026-11-26-ganqiao-runtime.md."""

import math,struct,json,io,zipfile
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np
from numba import njit
C={'f4':5126,'u2':5123}
N=lambda a: np.asarray(a,dtype=np.float32)
def load(b):
 n=struct.unpack_from('<I',b,12)[0];return json.loads(b[20:n+20]),bytearray(b[n+28:])
def get(j,b,ax):
 a=j['accessors'][ax];v=j['bufferViews'][a['bufferView']];nc={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
 d=np.dtype({5126:'<f4',5123:'<u2',5125:'<u4',5121:'u1'}[a['componentType']])
 return np.ndarray((a['count'],nc),dtype=d,buffer=b,offset=v.get('byteOffset',0)+a.get('byteOffset',0),strides=(v.get('byteStride',d.itemsize*nc),d.itemsize)).copy()
def add(j,b,a,kind,target=None,limits=False):
 a=np.asarray(a,order='C');b.extend(b'\0'*(-len(b)%4));vi=len(j['bufferViews'])
 v=dict(buffer=0,byteOffset=len(b),byteLength=a.nbytes)
 if target:v['target']=target
 j['bufferViews'].append(v); b.extend(a.tobytes());ax=len(j['accessors'])
 item=dict(bufferView=vi,componentType=C[a.dtype.str[1:]],count=a.shape[0],type=kind)
 if limits:item.update(min=a.reshape(len(a),-1).min(0).tolist(),max=a.reshape(len(a),-1).max(0).tolist())
 j['accessors'].append(item);return ax
def glb(j,b):
 b.extend(b'\0'*(-len(b)%4));j['buffers'][0]['byteLength']=len(b)
 s=json.dumps(j,separators=(',',':')).encode();s+=b' '*(-len(s)%4)
 return struct.pack('<4sII',b'glTF',2,28+len(s)+len(b))+struct.pack('<I4s',len(s),b'JSON')+s+struct.pack('<I4s',len(b),b'BIN\0')+b

@njit
def pixels(p,idx,uv,tex,w,h):
 im=np.full((h,w,3),235,np.uint8);zbuf=np.full((h,w),-1e20)
 for k in range(0,len(idx),3):
  a,b,c=idx[k:k+3];x0,y0,z0=p[a];x1,y1,z1=p[b];x2,y2,z2=p[c]
  dx=x1-x0;dy=y1-y0;ex=x2-x0;ey=y2-y0;den=dx*ey-dy*ex
  if abs(den)<1.e-7:continue
  for y in range(max(0,int(min(y0,y1,y2))),min(h,int(max(y0,y1,y2))+2)):
   for x in range(max(0,int(min(x0,x1,x2))),min(w,int(max(x0,x1,x2))+2)):
    f=((x+.5-x0)*ey-(y+.5-y0)*ex)/den;g=(dx*(y+.5-y0)-dy*(x+.5-x0))/den;t=1-f-g
    if min(f,g,t)<0:continue
    z=z0*t+z1*f+z2*g
    if z<=zbuf[y,x]:continue
    zbuf[y,x]=z
    u,v=uv[a]*t+uv[b]*f+uv[c]*g
    im[y,x]=tex[int((v%1)*(tex.shape[0]-1)),int((u%1)*(tex.shape[1]-1))]
 return im

from scipy.spatial.transform import Rotation
def xform(n):
 if 'matrix' in n:return np.array(n['matrix']).reshape(4,4).T
 m=np.eye(4);m[:3,:3]=Rotation.from_quat(n.get('rotation',[0,0,0,1])).as_matrix()*n.get('scale',[1,1,1]);m[:3,3]=n.get('translation',[0,0,0]);return m

import argparse
D=None
ROLE=['ganqiao_initial','ganqiao_mid','ganqiao_final']
def curve(t, keys): return float(np.interp(t, np.linspace(0,1,len(keys)),keys))
def key(t, f, a):return float(np.interp(t,f,a))

def repack(j,b,sel,idx,p,n,uv,ids,w,im,tex):
 j['bufferViews']=[];j['accessors']=[];b=bytearray()
 pr=j['meshes'][0]['primitives'][0];a=pr['attributes']
 for k,v,t in [('POSITION',p[sel],'VEC3'),('NORMAL',n[sel],'VEC3'),('TEXCOORD_0',uv[sel],'VEC2')]:
  a[k]=add(j,b,v.astype('<f4'),t,34962,limits=(k=='POSITION'))
 a['JOINTS_0']=add(j,b,ids[sel].astype('<u2'),'VEC4',34962)
 a['WEIGHTS_0']=add(j,b,w[sel].astype('<f4'),'VEC4',34962)
 pr['indices']=add(j,b,idx.astype('<u2'),'SCALAR',34963)
 j['skins'][0]['inverseBindMatrices']=add(j,b,im.transpose(0,2,1).reshape(-1,16).astype('<f4'),'MAT4')
 file=io.BytesIO()
 tex=Image.fromarray(tex)
 tex.thumbnail((1024,1024),Image.Resampling.LANCZOS)
 tex.save(file,format='JPEG',quality=90,optimize=True,subsampling=0)
 blob=file.getvalue()
 b.extend(b'\0'*(-len(b)%4));j['images'][0]['bufferView']=len(j['bufferViews'])
 j['bufferViews'].append(dict(buffer=0,byteOffset=len(b),byteLength=len(blob)))
 b.extend(blob)
 return b,np.array(Image.open(io.BytesIO(blob)).convert('RGB'))

def run(role, raw, output=True):
 j,b=load(raw); nd=j['nodes']; S=j['skins'][0]; js=S['joints']; names={nd[i]['name']:i for i in js}
 pr=j['meshes'][0]['primitives'][0]; a=pr['attributes']; p=get(j,b,a['POSITION']); ids=get(j,b,a['JOINTS_0']); w=get(j,b,a['WEIGHTS_0'])
 idx=get(j,b,pr['indices']).ravel().astype('int64');uv=get(j,b,a['TEXCOORD_0']); v=j['bufferViews'][j['images'][0]['bufferView']];o=v.get('byteOffset',0);tex=np.array(Image.open(io.BytesIO(b[o:o+v['byteLength']])).convert('RGB'))
 norm=get(j,b,a['NORMAL']);
 im=get(j,b,S['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1)
 par={k:i for i,n in enumerate(nd) for k in n.get('children',[])}
 loc=np.stack([xform(n) for n in nd]); h=p[:,1].max()
 def world(m):
  g={}
  def rec(i):
   if i not in g:g[i]=rec(par[i])@m[i] if i in par else m[i]
   return g[i]
  return np.stack([rec(k) for k in range(len(nd))])
 def pose(m):
  g=world(m);J=(g[js]@im)[ids]
  return ((np.einsum('nkij,nj->nki',J[:,:,:3,:3],p)+J[:,:,:3,3])*w[:,:,None]).sum(1),g
 assert np.max(abs(pose(loc)[0]-p))<.002
 small,mid,final=[role==n for n in ROLE]
 # Retain the original topology; small UV islands on claws and horns must stay intact.
 sel,idx2=np.arange(len(p)),idx
 b,tex=repack(j,b,sel,idx2,p,norm,uv,ids,w,im,tex)
 p,norm,uv,ids,w=p[sel],norm[sel],uv[sel],ids[sel],w[sel];idx=idx2.astype('int64')
 print(role,'verts/tris',len(p),len(idx)//3,flush=True)
 def do(name,t):
  m=loc.copy();sn=math.sin(math.tau*t); cs=math.cos(math.tau*t)
  def R(n,axis,deg):
   k=names[n];m[k,:3,:3]=m[k,:3,:3]@Rotation.from_euler(axis,deg,degrees=True).as_matrix()
  def T(n,axis,x):
   m[names[n],'xyz'.index(axis),3]+=h*x
  def leg(side,part,swing,flex):
   R(side+'_'+part+'Leg','x',swing);R(side+'_'+part+'Paw','x',flex)
  def tail(ang):
   for i,n in enumerate(['TailBase','TailMid','TailTip']):
    R(n,'y',ang*[.65,.8,1][i])
  def jaw(x):R('Jaw','x',x)
  if name=='Idle':
   T('Body','y',.008*(1-cs));R('Head','z',2*sn);tail(7*sn)
  if name=='Run':
   T('Body','y',(.025 if small else .018)*(sn*sn));R('Body','x',4+2*cs);R('Head','x',-3)
   for side,sg in [('L',1),('R',-1)]:
    leg(side,'Hind',(24 if small else 18)*sn*sg,-8*max(0,sn*sg))
    leg(side,'Front',(-19 if final else -16)*sn*sg,-5*max(0,-sn*sg))
   tail(13*sn)
  if name=='Swipe':
   f=[0,.24,.53,2/3,.76,1]
   u=key(t,f,[0,-.4,-.85,1,.63,0])
   v=key(t,f,[0,.22,.54,1,.67,0])
   k='R' if small else 'L'; side=-1 if small else 1
   R('Body','y',side*19*u);R('Body','x',5*u);T('Body','y',-.012*max(u,0));R('Head','y',-side*8*u)
   leg(k,'Front',-58*v,-8*v);R(k+'_FrontLeg','y',-side*18*u);R(k+'_FrontPaw','z',side*7*v)
   leg('L' if small else 'R','Front',12*v,-6*v);tail(-side*21*u)
  if name=='Flinch':
   u=curve(t,[0,1,.55,.2,0]);R('Body','x',-17*u);R('Head','x',-10*u);T('Body','z',-.058*u);tail(14*u)
  if name=='Dazed':
   R('Head','z',13*sn);R('Body','z',5*sn);R('Head','x',8);tail(5*cs)
  if name=='Fall':
   u=key(t,[0,.22,.64,.87,1],[0,.22,.90,1,1])
   R('Body','z',-59*u);R('Body','x',-13*u);T('Body','y',(-.19 if final else -.24)*u);R('Head','z',-14*u)
   leg('L','Front',-23*u,15*u);leg('R','Hind',-19*u,11*u);tail(-13*u)
  if name=='Roar':
   u=curve(t,[0,.45,1,1,.62,0]);R('Body','x',-16*u);R('Head','x',-20*u);T('Body','y',.038*u);jaw(18*u);leg('L','Front',-22*u,2*u);leg('R','Front',-23*u,2*u)
  if name=='Breath':
   a=key(t,[0,.13,.237,.263,.37,.60,.842,1],[0,.65,1,.05,.1,.12,.24,0])
   blow=key(t,[0,.232,.263,.842,.94,1],[0,0,1,1,.12,0])
   sweep=key(t,[0,.236,.263,.842,1],[0,-.8,-1,1,0])
   R('Body','x',-12*a+4*blow);T('Body','y',.04*a-.023*blow)
   R('Head','y',29*sweep);R('Head','x',-24*a+12*blow);jaw(9*a+23*blow);tail(-14*sweep)
  if name=='Charge':
   crouch=key(t,[0,.17,.44,.467,.56,.83,1],[0,.7,1,1,.22,.22,0])
   go=key(t,[0,.45,.5,.55,.91,1],[0,0,.87,1,1,0]); cyc=math.sin(max(0,t-.466)*math.tau*5.4)
   T('Body','y',-.09*crouch+.035*go*abs(cyc));R('Body','x',(7 if final else 12)*crouch-5*go);R('Head','x',5*crouch-12*go);tail(19*cyc*go)
   for side,sg in [('L',1),('R',-1)]:
    leg(side,'Front',10*crouch-26*go*cyc*sg,-7*crouch)
    leg(side,'Hind',-7*crouch+27*go*cyc*sg,-7*go)
  if name=='Slam':
   f=[0,.27,.66,.9,.985,1];a=key(t,f,[0,.68,1,.44,0,0]);b=key(t,f,[0,0,0,.55,1,.91])
   R('Body','x',-17*a+(12 if final else 15)*b);T('Body','y',.085*a-.075*b);R('Head','x',-11*a+(6 if final else 9)*b);tail(14*a)
   for side in 'LR':
    leg(side,'Front',-43*a+9*b,-9*a+8*b);leg(side,'Hind',15*a-9*b,-7*a)
  # Keep the feet/belly grounded through attacks and the final KO pose.
  posed,_=pose(m)
  floor=np.quantile(posed[:,1],.002)
  target=.005*h if name not in ('Fall','Slam') else 0
  if floor<target or name=='Fall':
   m[names['Body'],1,3]+=target-floor
  return m
 unique,ix,inv=np.unique(np.round(p,5),axis=0,return_index=True,return_inverse=True)
 e=np.sort(inv[idx.reshape(-1,3)[:,[0,1,1,2,2,0]]].reshape(-1,2),axis=1); e=np.unique(e,axis=0)
 el=lambda v:np.linalg.norm(v[e[:,0]]-v[e[:,1]],axis=1)
 baseline=el(p[ix]);keep=baseline>.003
 opts=[('Idle',1.7),('Run',.68 if small else .77),('Flinch',.30),('Dazed',.78),('Fall',.80),('Swipe',.75)]
 if not small:opts.extend([('Breath' if final else 'Roar',1.9 if final else .5),('Charge',1.5),('Slam',.95)])
 j['animations']=[]; mx={}; out=Image.new('RGB',(900,len(opts)*192),'#e9e9ee');dd=ImageDraw.Draw(out)
 for row,(name,dur) in enumerate(opts):
  sample=np.linspace(0,1,41 if name in ('Breath','Charge') else 21)
  ts=add(j,b,(sample*dur).astype('<f4'),'SCALAR',limits=True)
  seq=np.stack([do(name,t) for t in sample]);ch=[];sa=[]
  def track(node,key,a,typ):
   z=add(j,b,np.asarray(a,dtype='<f4'),typ);sa.append(dict(input=ts,output=z,interpolation='LINEAR'));ch.append(dict(sampler=len(sa)-1,target=dict(node=node,path=key)))
  for n in js:
   mats=seq[:,n]
   # Only moving bones get tracks; always include key 0 and rest endpoints.
   if np.max(abs(mats[:,:3,:3]-loc[n,:3,:3]))>1e-6:
    q=Rotation.from_matrix(mats[:,:3,:3]).as_quat()
    for i in range(1,len(q)):
     if q[i]@q[i-1]<0:q[i]*=-1
    track(n,'rotation',q,'VEC4')
   if np.max(abs(mats[:,:3,3]-loc[n,:3,3]))>1e-6:track(n,'translation',mats[:,:3,3],'VEC3')
  j['animations'].append(dict(name=name,channels=ch,samplers=sa))
  checks=[]
  for i,t in enumerate(sample):
   pp,g=pose(seq[i]); now=el(pp[ix])
   checks.append([np.quantile(now[keep]/baseline[keep],.995),np.quantile(now[keep]/baseline[keep],.005),np.min(pp[:,1]),np.max(pp[:,1]),np.max(now[keep]-baseline[keep])])
  chks=np.asarray(checks)
  mx[name]=np.round([max(chks[:,0]),min(chks[:,1]),min(chks[:,2]),max(chks[:,3]),max(chks[:,4])],4).tolist()
  at={'Swipe':[0,.5,.667,.79], 'Breath':[0,.16,.4,.8],'Slam':[0,.4,.78,1],'Charge':[0,.4,.6,.78],'Fall':[0,.35,.64,1]}.get(name,[0,.24,.51,.73])
  for col,t in enumerate(at):
   pp,g=pose(do(name,t));rot=.77 if final else .55
   c,s=np.cos(rot),np.sin(rot);pt=pp@N([[c,0,s],[0,1,0],[-s,0,c]]).T;sc=(291 if final else 182)
   sc=(217 if final else 162)
   pt[:,0]=pt[:,0]*sc+112;pt[:,1]=158-pt[:,1]*sc
   out.paste(Image.fromarray(pixels(pt*2,idx,uv,tex,450,348)).resize((225,174),Image.Resampling.LANCZOS),(col*225,row*192+17))
  dd.text((9,row*192+2),name,fill='#282534')
 (D/f'BraveGuy_{role}_GameMotion_QA.jpg').parent.mkdir(exist_ok=True)
 out.save(D/f'BraveGuy_{role}_GameMotion_QA.jpg',quality=90)
 if output:(D/f'BraveGuy_{role}_GameMotion_v1.glb').write_bytes(glb(j,b))
 print(role,len(js),mx,flush=True)
if __name__=='__main__':
 ap=argparse.ArgumentParser(description='Build game-ready GLBs and action sheets from the original three rigs.')
 ap.add_argument('--rig-zip',type=Path,required=True);ap.add_argument('--output',type=Path,required=True);a=ap.parse_args();D=a.output;D.mkdir(parents=True,exist_ok=True)
 with zipfile.ZipFile(a.rig_zip) as z:
  for r in ROLE:run(r,z.read(f'GLB/{r}_rig.glb'))
