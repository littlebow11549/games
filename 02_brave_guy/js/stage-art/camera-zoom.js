  const MIN_ZOOM = 0.85, MAX_ZOOM = 1.75, DEFAULT_ZOOM = 1;
  export function enableCameraZoom(g) {
    const canvas = document.getElementById('scene');
    const camera = g.camera;
    if (!canvas || !camera) return;
    const reset = document.createElement('button');
    reset.id = 'brave3d-zoom-reset';
    reset.type = 'button';
    reset.setAttribute('aria-label', '恢復預設視角');
    reset.title = '點一下回到 100% 原視角';
    const readout=document.createElement('b');readout.className='camera-zoom-value';
    const glyph=document.createElementNS('http://www.w3.org/2000/svg','svg');
    glyph.setAttribute('viewBox','0 0 20 20');
    glyph.setAttribute('aria-hidden','true');
    const trace=document.createElementNS(glyph.namespaceURI,'path');
    trace.setAttribute('d','M14.8 6.7A6 6 0 1 0 16 12M15.7 3.6v4.2h-4.3');
    glyph.append(trace);reset.append(readout,glyph);
    document.querySelector('#btn-mute').before(reset);
    canvas.style.touchAction = 'none';
    function setZoom(value) {
      if (!Number.isFinite(value)) return;
      const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
      if (z !== camera.zoom) { camera.zoom = z; camera.updateProjectionMatrix(); }
      const percent=Math.round(z*100)+'%';
      if(readout.textContent!==percent)readout.textContent=percent;
      reset.dataset.changed=String(Math.abs(z-DEFAULT_ZOOM)>.005);
    }
    const playing = () => g.game.phase === 'playing' && !g.game.paused;
    setZoom(DEFAULT_ZOOM);
    reset.addEventListener('click', () => setZoom(DEFAULT_ZOOM));
    const passiveFalse = {passive:false};
    let nativeGesture = null;
    canvas.addEventListener('wheel', e => {
      if (!playing()) return;
      if (e.cancelable) e.preventDefault();
      if (nativeGesture || (Math.abs(e.deltaX) > Math.abs(e.deltaY) && !e.ctrlKey)) return;
      const dy = e.deltaY*(e.deltaMode===1 ? 16 : e.deltaMode===2 ? canvas.clientHeight : 1);
      if (Number.isFinite(dy)) setZoom(camera.zoom * Math.exp(-Math.max(-180, Math.min(180,dy))*.0028));
    }, passiveFalse);

    const fingers = new Map();
    let distance = 0;
    function span() {
      if (fingers.size !== 2) return 0;
      const [p,q] = fingers.values();
      return Math.hypot(q.x-p.x,q.y-p.y);
    }
    canvas.addEventListener('pointerdown', e => {
      if (!playing() || e.pointerType !== 'touch') return;
      fingers.set(e.pointerId, {x:e.clientX, y:e.clientY});
      try { canvas.setPointerCapture(e.pointerId); } catch {}
      distance = span();
      if (fingers.size >= 2) nativeGesture = null;
    });
    canvas.addEventListener('pointermove', e => {
      if (!fingers.has(e.pointerId)) return;
      fingers.set(e.pointerId, {x:e.clientX,y:e.clientY});
      const now = span();
      if (playing() && now > 8 && distance > 8) setZoom(camera.zoom * now / distance);
      distance = now;
    });
    function release(e) {
      fingers.delete(e.pointerId);
      distance = span();
    }
    for (const type of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(type, release);
    function clear() { fingers.clear(); distance=0; nativeGesture=null; }
    addEventListener('blur', clear);
    document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
    // Safari trackpad gesture. On touch screens the two pointer events own the same gesture.
    canvas.addEventListener('gesturestart', e => {
      if (!playing()) return;
      if(e.cancelable) e.preventDefault();
      if (!fingers.size) nativeGesture={last:Number(e.scale)||1};
    },passiveFalse);
    canvas.addEventListener('gesturechange', e => {
      if (!playing()) return;
      if(e.cancelable) e.preventDefault();
      const scale=Number(e.scale);
      if (!fingers.size && nativeGesture && scale > 0) {
        setZoom(camera.zoom * scale / nativeGesture.last);
        nativeGesture.last=scale;
      }
    },passiveFalse);
    canvas.addEventListener('gestureend', e => {
      if(nativeGesture&&e.cancelable)e.preventDefault();
      nativeGesture = null;
    },passiveFalse);
  }
