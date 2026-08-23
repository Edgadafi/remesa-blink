import {
  CubeLattice3D,
  WireTorus3D,
} from "@/components/landing/LandingWirePrimitives";
import {
  MATRIX_FAMILY_SCENE,
  MATRIX_TORUS,
} from "@/components/landing/matrix-torus-config";
import { parallaxTransform, type WireParallax } from "@/components/landing/useLandingWireParallax";

type Props = {
  parallax?: WireParallax;
};

/** Familias — mismos R/r MatrixPay, apilados en panel vertical. */
export function LandingFamilyArt({ parallax = { x: 0, y: 0 } }: Props) {
  const { ox, oy, sceneScale, offsetY } = MATRIX_FAMILY_SCENE;
  const sceneTransform = `translate(${ox} ${oy}) scale(${sceneScale}) translate(${-ox} ${-oy})`;
  const { R, r, rotX, uSeg, vSeg, strokeScale } = MATRIX_TORUS;

  const colSpacing = 16;
  const colCols = 3;
  const colRows = 9;
  const colDepth = 4;

  return (
    <svg
      className="landing-family-art landing-wire-art"
      viewBox="0 0 640 800"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="hf-sol-a" x1="92%" y1="8%" x2="8%" y2="92%">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="52%" stopColor="#8752F3" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
      </defs>

      <rect width="640" height="800" fill="#fffdf8" />

      <g transform={sceneTransform}>
        <g transform={parallaxTransform(parallax, -0.28)}>
          <g
            className="landing-wire-torus-wrap landing-wire-torus-wrap--matrix landing-wire-torus-wrap--matrix-slow"
            style={{ transformOrigin: `${ox}px ${oy - offsetY}px` }}
          >
            <WireTorus3D
              R={R}
              r={r}
              rotX={rotX + 0.35}
              rotY={0}
              offset={[0, offsetY, 0]}
              ox={ox}
              oy={oy}
              uSeg={uSeg}
              vSeg={vSeg}
              strokeScale={strokeScale}
            />
          </g>
        </g>

        <g transform={parallaxTransform(parallax, -0.24)}>
          <g
            className="landing-wire-torus-wrap landing-wire-torus-wrap--matrix landing-wire-torus-wrap--matrix-rev"
            style={{ transformOrigin: `${ox}px ${oy + offsetY}px` }}
          >
            <WireTorus3D
              R={R}
              r={r}
              rotX={-rotX - 0.35}
              rotY={0}
              offset={[0, -offsetY, 0]}
              ox={ox}
              oy={oy}
              uSeg={uSeg}
              vSeg={vSeg}
              strokeScale={strokeScale}
            />
          </g>
        </g>

        <g transform={parallaxTransform(parallax, 0.08)} className="landing-wire-depth-mid landing-wire-depth-mid--soft">
          <g
            className="landing-wire-torus-wrap landing-wire-torus-wrap--matrix"
            style={{ transformOrigin: `${ox}px ${oy}px` }}
          >
            <WireTorus3D
              R={R * 0.48}
              r={r * 0.48}
              rotX={0}
              rotY={1.57}
              offset={[0, 0, 0]}
              ox={ox}
              oy={oy}
              uSeg={12}
              vSeg={6}
              strokeScale={strokeScale}
            />
          </g>

          <CubeLattice3D
            origin={[
              -((colCols - 1) * colSpacing) / 2,
              -((colRows - 1) * colSpacing) / 2,
              -((colDepth - 1) * colSpacing) / 2,
            ]}
            cols={colCols}
            rows={colRows}
            depth={colDepth}
            spacing={colSpacing}
            ox={ox}
            oy={oy}
            edgeMode="minimal"
          />
        </g>
      </g>
    </svg>
  );
}
