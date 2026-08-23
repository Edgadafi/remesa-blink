"use client";

import { useEffect, useRef, useState } from "react";

export type WireParallax = { x: number; y: number };

/** Parallax ligero según cursor dentro del contenedor wireframe. */
export function useLandingWireParallax(maxX = 14, maxY = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState<WireParallax>({ x: 0, y: 0 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const onMove = (event: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      setParallax({ x: nx * maxX, y: ny * maxY });
    };

    const onLeave = () => setParallax({ x: 0, y: 0 });

    node.addEventListener("mousemove", onMove);
    node.addEventListener("mouseleave", onLeave);

    return () => {
      node.removeEventListener("mousemove", onMove);
      node.removeEventListener("mouseleave", onLeave);
    };
  }, [maxX, maxY]);

  return { ref, parallax };
}

export function parallaxTransform(p: WireParallax, depth: number): string {
  return `translate(${(p.x * depth).toFixed(2)} ${(p.y * depth).toFixed(2)})`;
}
