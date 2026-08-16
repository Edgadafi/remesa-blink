"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/components/Nav";
import { DeferredCorridor } from "@/components/scene3d/DeferredCorridor";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPiloto = pathname?.startsWith("/piloto");
  const isDemo = pathname?.startsWith("/demo");
  const isEmpezar = pathname?.startsWith("/empezar");

  /* Escenas full-bleed sin chrome del hub */
  if (isPiloto || isDemo || isEmpezar) {
    return <>{children}</>;
  }

  return (
    <div className="site-wrap">
      <DeferredCorridor />
      <Nav />
      {children}
      <footer className="site-footer">
        Remesa Blink — Send dollars, recibe pesos más cerca de tu familia.{" "}
        <a href="mailto:remesatia@gmail.com">remesatia@gmail.com</a>
        {" · "}
        Envía a tu familia con claridad; la wallet es opcional.
      </footer>
    </div>
  );
}
