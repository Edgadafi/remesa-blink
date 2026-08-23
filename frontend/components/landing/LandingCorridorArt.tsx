import {
  CubeBridge3D,
  CubeLattice3D,
  WireTorus3D,
} from "@/components/landing/LandingWirePrimitives";
import {
  MATRIX_HERO_SCENE,
  MATRIX_TORUS,
} from "@/components/landing/matrix-torus-config";
import { parallaxTransform, type WireParallax } from "@/components/landing/useLandingWireParallax";

type Props = {
  parallax?: WireParallax;
};

/** Hero — toroides MatrixPay (dimensiones + rotación continua). */
export function LandingCorridorArt({ parallax = { x: 0, y: 0 } }: Props) {
  const { ox, oy, sceneScale } = MATRIX_HERO_SCENE;
  const sceneTransform = `translate(${ox} ${oy}) scale(${sceneScale}) translate(${-ox} ${-oy})`;
  const { R, r, rotX, rotY, offsetX, uSeg, vSeg, strokeScale } = MATRIX_TORUS;

  return (
    <svg
      className="landing-corridor-art landing-wire-art"
      viewBox="0 0 720 450"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="hw-sol-a" x1="92%" y1="8%" x2="8%" y2="92%">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="52%" stopColor="#8752F3" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
      </defs>

      <rect width="720" height="450" fill="#fffdf8" />

      <g transform={sceneTransform}>
        {/* Par toroides — rotación continua como torus.webm (una sola unidad) */}
        <g transform={parallaxTransform(parallax, -0.32)}>
          <g
            className="landing-wire-torus-wrap landing-wire-torus-wrap--matrix"
            style={{ transformOrigin: `${ox}px ${oy}px` }}
          >
            <WireTorus3D
              R={R}
              r={r}
              rotX={rotX}
              rotY={-rotY}
              offset={[-offsetX, 0, 0]}
              ox={ox}
              oy={oy}
              uSeg={uSeg}
              vSeg={vSeg}
              strokeScale={strokeScale}
            />
            <WireTorus3D
              R={R}
              r={r}
              rotX={rotX}
              rotY={rotY}
              offset={[offsetX, 0, 0]}
              ox={ox}
              oy={oy}
              uSeg={uSeg}
              vSeg={vSeg}
              strokeScale={strokeScale}
            />
          </g>
        </g>

        <g transform={parallaxTransform(parallax, 0.12)} className="landing-wire-depth-mid landing-wire-depth-mid--soft">
          <CubeLattice3D
            origin={[-72, -18, -20]}
            cols={10}
            rows={2}
            depth={3}
            spacing={12}
            ox={ox}
            oy={oy}
            edgeMode="lite"
          />
          <CubeBridge3D
            xStart={-58}
            xEnd={58}
            y={0}
            z={0}
            count={14}
            rows={2}
            layers={2}
            spacing={12}
            ox={ox}
            oy={oy}
          />
        </g>
      </g>
    </svg>
  );
}
