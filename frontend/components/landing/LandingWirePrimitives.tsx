import { SolanaLogoPaths } from "@/components/landing/SolanaLogoMark";
import type { CubeEdgeMode, Vec3 } from "@/components/landing/landing-wire-3d";
import {
  buildBridgeCubes3D,
  buildCubeLattice3D,
  cubeEdgePaths,
  toScreen,
  torusWirePaths,
  type CubeInstance,
} from "@/components/landing/landing-wire-3d";

const STROKE = "#2d5016";
const MESH = "#4a7c59";
const ACCENT = "#c9a227";

type SceneProps = {
  ox: number;
  oy: number;
  stroke?: string;
  mesh?: string;
};

function WireCube3DGroup({
  cubes,
  ox,
  oy,
  stroke = STROKE,
  mesh = MESH,
  edgeMode = "full",
}: SceneProps & { cubes: CubeInstance[]; edgeMode?: CubeEdgeMode }) {
  return (
    <g className="landing-wire-3d-cubes">
      {cubes.map((cube, idx) => {
        const paths = cubeEdgePaths(cube.center, cube.half, ox, oy, edgeMode);
        const color = cube.accent ? ACCENT : mesh;
        const sw = cube.accent ? 0.85 : edgeMode === "minimal" ? 0.5 : 0.55;
        return (
          <g key={`cube-${idx}`} opacity={cube.accent ? 0.95 : 0.68}>
            {paths.map((d, i) => (
              <path
                key={`e-${idx}-${i}`}
                d={d}
                fill="none"
                stroke={edgeMode === "minimal" ? mesh : i > 7 ? stroke : color}
                strokeWidth={sw}
                strokeLinejoin="round"
              />
            ))}
          </g>
        );
      })}
    </g>
  );
}

type TorusProps = SceneProps & {
  R: number;
  r: number;
  rotX: number;
  rotY: number;
  offset: Vec3;
  uSeg?: number;
  vSeg?: number;
  className?: string;
  /** Grosor relativo (+200 % = 3). */
  strokeScale?: number;
};

export function WireTorus3D({
  R,
  r,
  rotX,
  rotY,
  offset,
  ox,
  oy,
  stroke = STROKE,
  mesh = MESH,
  uSeg = 28,
  vSeg = 14,
  className,
  strokeScale = 3,
}: TorusProps) {
  const paths = torusWirePaths(R, r, rotX, rotY, offset, ox, oy, uSeg, vSeg);
  const majorSw = 0.75 * strokeScale;
  const minorSw = 0.45 * strokeScale;

  return (
    <g className={["landing-wire-3d-torus", className].filter(Boolean).join(" ")} opacity="0.9">
      {paths.map((d, i) => (
        <path
          key={`t-${i}`}
          d={d}
          fill="none"
          stroke={i % 3 === 0 ? stroke : mesh}
          strokeWidth={i % 3 === 0 ? majorSw : minorSw}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={i % 3 === 0 ? 0.88 : 0.58}
        />
      ))}
    </g>
  );
}

type LatticeProps = SceneProps & {
  origin: Vec3;
  cols: number;
  rows: number;
  depth: number;
  spacing: number;
  edgeMode?: CubeEdgeMode;
};

export function CubeLattice3D({ edgeMode = "full", ...props }: LatticeProps) {
  const cubes = buildCubeLattice3D(
    props.origin,
    props.cols,
    props.rows,
    props.depth,
    props.spacing,
  );
  return (
    <WireCube3DGroup
      cubes={cubes}
      ox={props.ox}
      oy={props.oy}
      stroke={props.stroke}
      mesh={props.mesh}
      edgeMode={edgeMode}
    />
  );
}

type BridgeProps = SceneProps & {
  xStart: number;
  xEnd: number;
  y: number;
  z: number;
  count: number;
  rows: number;
  layers: number;
  spacing: number;
};

export function CubeBridge3D(props: BridgeProps) {
  const cubes = buildBridgeCubes3D(
    props.xStart,
    props.xEnd,
    props.y,
    props.z,
    props.count,
    props.rows,
    props.layers,
    props.spacing,
  );
  return <WireCube3DGroup cubes={cubes} ox={props.ox} oy={props.oy} stroke={props.stroke} mesh={props.mesh} />;
}

type SolanaProps = {
  position: Vec3;
  ox: number;
  oy: number;
  gradientId: string;
  size?: number;
  logoScale?: number;
  /** Coordenadas fijas en el viewBox (centro del frame). */
  centerX?: number;
  centerY?: number;
  screenCenter?: boolean;
};

/** Nodo Solana — glow sutil; logotipo canónico sin marco. */
export function SolanaNode3D({
  position,
  ox,
  oy,
  gradientId,
  size = 14,
  logoScale = 1,
  centerX,
  centerY,
  screenCenter = false,
}: SolanaProps) {
  const projected = toScreen(position, ox, oy);
  const sx = centerX ?? (screenCenter ? ox : projected[0]);
  const sy = centerY ?? (screenCenter ? oy : projected[1]);
  const logoWidth = size * logoScale;
  const scale = logoWidth / 397.7;
  const cx = 198.85;
  const cy = 155.85;

  return (
    <g className="landing-wire-sol-node">
      <g transform={`translate(${sx.toFixed(2)} ${sy.toFixed(2)})`}>
        <g
          className="landing-wire-sol-mark"
          transform={`scale(${scale.toFixed(4)}) translate(${-cx} ${-cy})`}
        >
          <SolanaLogoPaths gradientId={gradientId} />
        </g>
      </g>
    </g>
  );
}
