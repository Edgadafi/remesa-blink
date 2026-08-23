/** Proyección isométrica y geometría 3D wireframe (MatrixPay). */

export const COS30 = Math.sqrt(3) / 2;
export const SIN30 = 0.5;

export type Vec3 = [number, number, number];

export function isoProject(x: number, y: number, z: number): [number, number] {
  return [(x - z) * COS30, -y + (x + z) * SIN30];
}

export function toScreen(p: Vec3, ox: number, oy: number): [number, number] {
  const [px, py] = isoProject(p[0], p[1], p[2]);
  return [px + ox, py + oy];
}

export function rotateX(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
}

export function rotateY(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
}

export function transformPoint(p: Vec3, rotX: number, rotY: number, offset: Vec3): Vec3 {
  let t = rotateX(p, rotX);
  t = rotateY(t, rotY);
  return [t[0] + offset[0], t[1] + offset[1], t[2] + offset[2]];
}

const CUBE_EDGES: [number, number][] = [
  [0, 1],
  [1, 3],
  [3, 2],
  [2, 0],
  [4, 5],
  [5, 7],
  [7, 6],
  [6, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

/** 4 aristas — cara superior (≈ −67 % trazos). */
const LITE_CUBE_EDGES: [number, number][] = [
  [4, 5],
  [5, 7],
  [7, 6],
  [6, 4],
];

/** 1 arista vertical (≈ −92 % trazos por cubo). */
const MINIMAL_CUBE_EDGES: [number, number][] = [[4, 7]];

export type CubeEdgeMode = "full" | "lite" | "minimal";

function edgesForMode(mode: CubeEdgeMode): [number, number][] {
  if (mode === "lite") return LITE_CUBE_EDGES;
  if (mode === "minimal") return MINIMAL_CUBE_EDGES;
  return CUBE_EDGES;
}

export function cubeVertices(half: number): Vec3[] {
  return [
    [-half, -half, -half],
    [half, -half, -half],
    [half, -half, half],
    [-half, -half, half],
    [-half, half, -half],
    [half, half, -half],
    [half, half, half],
    [-half, half, half],
  ];
}

export function cubeEdgePaths(
  center: Vec3,
  half: number,
  ox: number,
  oy: number,
  mode: CubeEdgeMode = "full",
): string[] {
  const verts = cubeVertices(half).map(([x, y, z]) => [x + center[0], y + center[1], z + center[2]] as Vec3);
  return edgesForMode(mode).map(([a, b]) => {
    const [x1, y1] = toScreen(verts[a], ox, oy);
    const [x2, y2] = toScreen(verts[b], ox, oy);
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  });
}

export function depthKey(p: Vec3): number {
  return p[0] + p[2] - p[1];
}

export function torusPoint(u: number, v: number, R: number, r: number): Vec3 {
  return [(R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u)];
}

export function torusWirePaths(
  R: number,
  r: number,
  rotX: number,
  rotY: number,
  offset: Vec3,
  ox: number,
  oy: number,
  uSeg = 28,
  vSeg = 14,
): string[] {
  const paths: string[] = [];

  for (let i = 0; i < uSeg; i += 1) {
    const u = (i / uSeg) * Math.PI * 2;
    const pts: [number, number][] = [];
    for (let j = 0; j <= vSeg; j += 1) {
      const v = (j / vSeg) * Math.PI * 2;
      const p = transformPoint(torusPoint(u, v, R, r), rotX, rotY, offset);
      pts.push(toScreen(p, ox, oy));
    }
    paths.push(
      pts.map(([x, y], idx) => `${idx === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" "),
    );
  }

  for (let j = 0; j < vSeg; j += 1) {
    const v = (j / vSeg) * Math.PI * 2;
    const pts: [number, number][] = [];
    for (let i = 0; i <= uSeg; i += 1) {
      const u = (i / uSeg) * Math.PI * 2;
      const p = transformPoint(torusPoint(u, v, R, r), rotX, rotY, offset);
      pts.push(toScreen(p, ox, oy));
    }
    paths.push(
      pts.map(([x, y], idx) => `${idx === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" "),
    );
  }

  return paths;
}

export type CubeInstance = { center: Vec3; half: number; accent?: boolean };

export function buildCubeLattice3D(
  origin: Vec3,
  cols: number,
  rows: number,
  depth: number,
  spacing: number,
): CubeInstance[] {
  const cubes: CubeInstance[] = [];
  const half = spacing * 0.38;
  for (let d = 0; d < depth; d += 1) {
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        cubes.push({
          center: [
            origin[0] + col * spacing,
            origin[1] + row * spacing,
            origin[2] + d * spacing,
          ],
          half,
        });
      }
    }
  }
  return cubes.sort((a, b) => depthKey(a.center) - depthKey(b.center));
}

export function buildBridgeCubes3D(
  xStart: number,
  xEnd: number,
  y: number,
  z: number,
  count: number,
  rows: number,
  layers: number,
  spacing: number,
): CubeInstance[] {
  const cubes: CubeInstance[] = [];
  const half = spacing * 0.36;
  for (let layer = 0; layer < layers; layer += 1) {
    for (let row = 0; row < rows; row += 1) {
      for (let i = 0; i < count; i += 1) {
        const t = count === 1 ? 0.5 : i / (count - 1);
        const x = xStart + t * (xEnd - xStart);
        const rowOff = (row - (rows - 1) / 2) * spacing;
        const layerOff = (layer - (layers - 1) / 2) * spacing;
        const arc = Math.sin(t * Math.PI) * spacing * 1.4;
        cubes.push({
          center: [x, y + rowOff + arc, z + layerOff],
          half,
          accent: layer === Math.floor(layers / 2) && row === Math.floor(rows / 2) && i === Math.floor(count / 2),
        });
      }
    }
  }
  return cubes.sort((a, b) => depthKey(a.center) - depthKey(b.center));
}
