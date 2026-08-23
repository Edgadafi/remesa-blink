/**
 * Toroides a borde del frame (720×450 hero · 640×800 familias).
 * (offsetX + R + r) × cos30° × sceneScale ≈ mitad del ancho útil.
 */
export const MATRIX_TORUS = {
  R: 198,
  r: 66,
  rotX: 0.78,
  rotY: 0.58,
  offsetX: 52,
  uSeg: 32,
  vSeg: 16,
  strokeScale: 3,
} as const;

export const MATRIX_HERO_SCENE = {
  viewW: 720,
  viewH: 450,
  ox: 360,
  oy: 225,
  sceneScale: 1.32,
} as const;

export const MATRIX_FAMILY_SCENE = {
  viewW: 640,
  viewH: 800,
  ox: 320,
  oy: 400,
  sceneScale: 0.96,
  offsetY: 132,
} as const;

export const SOLANA_LOGO_SCALE = 6;

/** Centro del viewBox = centro del frame wire. */
export const SOLANA_HERO_CENTER = {
  x: MATRIX_HERO_SCENE.ox,
  y: MATRIX_HERO_SCENE.oy,
} as const;

export const SOLANA_FAMILY_CENTER = {
  x: MATRIX_FAMILY_SCENE.ox,
  y: MATRIX_FAMILY_SCENE.oy,
} as const;
