import { assetPath } from './asset-paths.js';
// Live deformation and light over the approved source art; no new image or raster export.
export function createMenuMotion() {
 const host=document.querySelector('#menu-art .art');
 const canvas=document.createElement('canvas');canvas.className='menu-live-art';canvas.setAttribute('aria-hidden','true');host.append(canvas);
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});
 if(!gl)return{update(){}};
 const vertex='attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
 const fragment=`precision mediump float;varying vec2 uv;uniform sampler2D art;uniform vec2 size;uniform vec2 imageSize;uniform float time;uniform float portrait;
 float hash(float n){return fract(sin(n*127.1)*43758.5453);}
 // Use the static menu artwork's cover crop and portrait anchor (center 42%).
 void main(){vec2 q=vec2(uv.x,1.-uv.y);float scale=max(size.x/imageSize.x,size.y/imageSize.y);vec2 drawn=imageSize*scale;vec2 offset=(size-drawn)*vec2(.5,portrait>.5?.42:.5);vec2 v=(q*size-offset)/drawn;
 if(v.y>1.||v.y<0.||v.x<0.||v.x>1.){gl_FragColor=vec4(.027,.188,.114,1.);return;}
 // Independent phases and torso masks keep the faces crisp and the motion restrained.
 vec2 d=vec2(0.);for(int j=0;j<3;j++){float i=float(j);float cx=.20+i*.31;float dx=(v.x-cx)*6.5;float mask=exp(-dx*dx)*(1.-smoothstep(.62,.94,v.y))*smoothstep(.03,.16,v.y);float breath=sin(time*(1.18+i*.09)+i*2.1);d.y+=mask*breath*.0025;d.x+=mask*(v.x-cx)*breath*.007;}
 vec4 color=texture2D(art,v+d);float energy=pow(max(0.,sin((v.x+v.y*.55)*12.-time*.9)),20.)*.075*smoothstep(.55,.95,v.y);color.rgb+=vec3(.3,1.,.13)*energy;
 for(int j=0;j<12;j++){float i=float(j);vec2 pt=vec2(hash(i+2.),1.-fract(time*.035+hash(i+9.)));float sparkle=max(0.,1.-length((v-pt)*vec2(1.,imageSize.y/imageSize.x))*180.);color.rgb+=vec3(.6,1.,.25)*sparkle*(.4+.6*pow(sin(time*2.+i),2.));}
 gl_FragColor=color;}`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 let program;
 try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('menu shader link');}catch(e){canvas.remove();console.warn('Menu motion uses static artwork fallback',e);return{update(){}};}
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
 const uniforms=Object.fromEntries(['size','imageSize','time','portrait'].map(k=>[k,gl.getUniformLocation(program,k)]));
 let ready=false, source='', imageSize=[1,1], last=0, lost=false, box=host.getBoundingClientRect(), painted='';
 new ResizeObserver(()=>{box=host.getBoundingClientRect();painted='';}).observe(host);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;canvas.style.opacity=0;});
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 function update(now,visible){if(!visible||document.hidden||lost||now-last<33||document.getElementById('overlay').classList.contains('stages'))return;last=now;
  const portrait=matchMedia('(orientation:portrait)').matches, url=assetPath(`assets/runtime/lossless/pic/branding/menu_keyart_${portrait?'portrait_01':'01'}.webp`);
  if(url!==source){source=url;ready=false;canvas.style.opacity=0;const img=new Image();img.onload=()=>{if(source!==url)return;gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);imageSize=[img.width,img.height];ready=true;};img.src=url;}
  if(!ready)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,stamp=`${source}:${box.width}:${box.height}:${devicePixelRatio}`;if(reduced&&painted===stamp)return;const ratio=Math.min(devicePixelRatio,1.5);const w=Math.round(box.width*ratio),h=Math.round(box.height*ratio);if(!w||!h)return;
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}gl.uniform2f(uniforms.size,box.width,box.height);gl.uniform2f(uniforms.imageSize,...imageSize);gl.uniform1f(uniforms.time,matchMedia('(prefers-reduced-motion: reduce)').matches?0:now/1000);gl.uniform1f(uniforms.portrait,portrait?1:0);gl.drawArrays(gl.TRIANGLES,0,6);canvas.style.opacity=1;painted=reduced?stamp:'';
 }
 return{update};
}
