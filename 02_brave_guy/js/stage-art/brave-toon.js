import * as THREE from '../../vendor/three/three.module.min.js';

function toonMaterial(original) {
  const toon = new THREE.MeshToonMaterial({
    map: original.map, color: original.color, side: original.side,
    toneMapped: false
  });
  toon.name = 'Brave Anime | Two-tone';
  toon.onBeforeCompile = shader => {
    const point = '#include <opaque_fragment>';
    shader.fragmentShader = shader.fragmentShader.replace(point, `
      vec3 inkColor = diffuseColor.rgb;
      float warmSkin = smoothstep(0.10, 0.28, inkColor.g)
        * smoothstep(0.045, 0.14, inkColor.b)
        * (1.0 - smoothstep(0.20, 0.40, inkColor.g - inkColor.b));
      vec3 key = normalize(vec3(-0.36, 0.71, 0.60));
      float diffuseAngle = dot(normalize(normal), key);
      float toonBand = smoothstep(0.15, 0.205, diffuseAngle);
      vec3 shadowInk = mix(vec3(0.68, 0.60, 0.70), vec3(0.87, 0.80, 0.80), warmSkin);
      float gem = smoothstep(0.075, 0.26, inkColor.g - max(inkColor.r, inkColor.b));
      vec3 halfAngle = normalize(key + vec3(0.0, 0.0, 1.0));
      float glint = gem * smoothstep(0.976, 0.989, dot(normalize(normal), halfAngle));
      outgoingLight = inkColor * mix(shadowInk, vec3(1.11, 1.08, 1.04), toonBand)
        + glint * vec3(0.10, 0.21, 0.035)
        + totalEmissiveRadiance;
      ${point}
    `);
  };
  toon.customProgramCacheKey = () => 'brave-cel-v1';
  return toon;
}

function contour(mesh) {
  const ink = new THREE.MeshBasicMaterial({
    color: 0x382636, side: THREE.BackSide, toneMapped: false
  });
  ink.name = 'Brave Anime | Ink';
  ink.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\ntransformed += normalize(normal) * 0.003;');
  };
  ink.customProgramCacheKey = () => 'brave-ink-v1';
  const shell = mesh.clone(false);
  shell.name = 'Brave Toon Outline';
  shell.material = ink;
  shell.castShadow = shell.receiveShadow = false;
  shell.position.set(0, 0, 0);
  shell.quaternion.identity();
  shell.scale.setScalar(1);
  shell.frustumCulled = false;
  shell.visible = false;
  mesh.add(shell);
  return shell;
}

export function applyBraveToon(mesh){
 const original=mesh.material;
 if(!original?.isMeshStandardMaterial || !original.map)return original;
 const toon=toonMaterial(original),line=contour(mesh);
 toon.emissive=original.emissive;
 toon.emissiveIntensity=original.emissiveIntensity;
 mesh.material=toon;line.visible=true;
 original.dispose();
 return toon;
}
