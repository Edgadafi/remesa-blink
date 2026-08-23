import { SolanaLogoMark } from "@/components/landing/SolanaLogoMark";
import { SOLANA_LOGO_SCALE } from "@/components/landing/matrix-torus-config";

const BASE_SIZE = 22;

type Props = {
  width?: number;
};

/** Logotipo Solana centrado en el frame (flexbox sobre la escena wire). */
export function LandingSolanaOverlay({ width = BASE_SIZE * SOLANA_LOGO_SCALE }: Props) {
  return (
    <div className="landing-sol-overlay" aria-hidden="true">
      <div className="landing-wire-sol-node">
        <div className="landing-wire-sol-mark">
          <SolanaLogoMark width={width} />
        </div>
      </div>
    </div>
  );
}
