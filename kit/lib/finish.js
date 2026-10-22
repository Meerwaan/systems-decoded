// The surface of a solid part: what a real one has and a modelled one lacks. Under the studio's light a machined part
// is never one even gradient — its highlight breaks on the grain of the tool (fine rings along the part's own axis on
// a turned piece, lines across a milled face) and goes duller where hands have been. All of it procedural (no texture,
// no UV), in the part's own centimetres, and every detail fades out before it gets finer than a few pixels: nothing
// crawls, nothing shimmers, a part seen from afar keeps its tone. Asked for in one line: createStage(…, { finish: 1 })
// (or `stage.finish` along the film). Which materials: the kit's solids (`solid()`), never a floor, a glow or glass;
// `material.userData.finish = false` keeps one bare.
const AMOUNT = { value: 0 };
const PATCHED = new WeakSet();

const VERTEX_HEAD = /* glsl */ `varying vec3 vSdPos; varying vec3 vSdAxis;\n`;
const VERTEX_BODY = /* glsl */ `#include <begin_vertex>
  vSdPos = transformed;
  vec3 sdAxis = vec3(0.0, 1.0, 0.0);
  #ifdef USE_INSTANCING
    sdAxis = mat3(instanceMatrix) * sdAxis;
  #endif
  vSdAxis = normalize(mat3(modelViewMatrix) * sdAxis);`;

const FRAGMENT_HEAD = /* glsl */ `uniform float uSdFinish; varying vec3 vSdPos; varying vec3 vSdAxis;
float sdHash(vec3 p) { p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float sdNoise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(sdHash(i), sdHash(i + vec3(1.0, 0.0, 0.0)), f.x), mix(sdHash(i + vec3(0.0, 1.0, 0.0)), sdHash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(sdHash(i + vec3(0.0, 0.0, 1.0)), sdHash(i + vec3(1.0, 0.0, 1.0)), f.x), mix(sdHash(i + vec3(0.0, 1.0, 1.0)), sdHash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}
`;

// After the roughness is read: a hand's width of duller and brighter patches, and the tool's rings (3 to the
// centimetre, wavering a little), faded out as soon as one ring would span less than about four pixels — never finer:
// a finer grain crawls as soon as the part moves.
const ROUGH = /* glsl */ `#include <roughnessmap_fragment>
  float sdGrain = 0.0;
  if (uSdFinish > 0.0) {
    float smudge = sdNoise(vSdPos * 0.18) * 0.65 + sdNoise(vSdPos * 0.61 + 7.3) * 0.35;
    float a = vSdPos.y * 3.0 + sdNoise(vSdPos * vec3(0.9, 0.08, 0.9)) * 0.8;
    sdGrain = sin(6.2831853 * a) * (1.0 - smoothstep(0.1, 0.25, fwidth(a)));
    roughnessFactor = clamp(roughnessFactor * (1.0 + uSdFinish * (0.55 * (smudge - 0.5) + 0.1 * sdGrain)), 0.04, 1.0);
  }`;

// After the normal is set: the rings tilt it a few degrees along the part's axis (a face square to the axis is left alone).
const NORMAL = /* glsl */ `#include <normal_fragment_maps>
  if (uSdFinish > 0.0 && sdGrain != 0.0) {
    vec3 sdAlong = vSdAxis - dot(vSdAxis, normal) * normal;
    float sdL = length(sdAlong);
    if (sdL > 1e-3) normal = normalize(normal + (sdAlong / sdL) * (uSdFinish * 0.07 * sdGrain * min(sdL * 2.0, 1.0)));
  }`;

const wants = (mat) => mat.isMeshStandardMaterial && mat.userData.finish !== false && (mat.polygonOffset || mat.userData.finish === true);

function patch(mat) {
  PATCHED.add(mat);
  const prior = mat.onBeforeCompile;
  mat.onBeforeCompile = function (shader, renderer) {
    prior?.call(this, shader, renderer);
    shader.uniforms.uSdFinish = AMOUNT;
    shader.vertexShader = VERTEX_HEAD + shader.vertexShader.replace("#include <begin_vertex>", VERTEX_BODY);
    shader.fragmentShader = FRAGMENT_HEAD + shader.fragmentShader.replace("#include <roughnessmap_fragment>", ROUGH).replace("#include <normal_fragment_maps>", NORMAL);
  };
  const key = mat.customProgramCacheKey.bind(mat);
  mat.customProgramCacheKey = () => `${key()}|sd-finish`;
  mat.needsUpdate = true;
}

/**
 * Called by the stage at every frame while `stage.finish` is (or has been) above 0: the materials met for the first
 * time get the surface (one compile each), and every one follows the amount. Returns whether the finish is in use.
 */
export function finishScene(root, amount) {
  AMOUNT.value = Math.max(0, amount);
  if (amount > 0) {
    root.traverse((o) => {
      const m = o.material;
      if (!m) return;
      for (const mat of Array.isArray(m) ? m : [m]) if (!PATCHED.has(mat) && wants(mat)) patch(mat);
    });
  }
  return true;
}
