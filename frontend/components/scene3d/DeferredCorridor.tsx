"use client";

import { useEffect, useState, type ComponentType } from "react";

/**
 * Static brand backdrop first. Three.js loads after first paint so the hub
 * is readable while the WebGL chunk compiles.
 */
export function DeferredCorridor() {
  const [Scene, setScene] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void import("./CorridorBackdrop").then((m) => {
        if (!cancelled) setScene(() => m.CorridorBackdrop);
      });
    };
    const hasIdle = "requestIdleCallback" in window;
    const idle = hasIdle
      ? window.requestIdleCallback(load, { timeout: 2500 })
      : window.setTimeout(load, 1200);
    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(idle as number);
      else window.clearTimeout(idle);
    };
  }, []);

  if (!Scene) return <div className="scene-3d-bg scene-3d-bg--static" aria-hidden />;
  return <Scene />;
}
