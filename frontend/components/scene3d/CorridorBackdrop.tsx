"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const CorridorScene = dynamic(
  () => import("./CorridorScene").then((m) => m.CorridorScene),
  { ssr: false, loading: () => null }
);

function webglOk(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

/**
 * Fondo 3D del corredor MX–US: riel de oro, núcleo nopal y monedas.
 * Transparente (alpha) sobre el papel de marca. Sin pointer events.
 */
export function CorridorBackdrop() {
  const reduced = usePrefersReducedMotion();
  const [pageVisible, setPageVisible] = useState(true);
  const [gl, setGl] = useState(false);

  useEffect(() => {
    setGl(webglOk());
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (!gl || reduced) {
    return <div className="scene-3d-bg scene-3d-bg--static" aria-hidden />;
  }

  return (
    <div className="scene-3d-bg" aria-hidden>
      <CorridorScene animate={pageVisible} />
    </div>
  );
}
