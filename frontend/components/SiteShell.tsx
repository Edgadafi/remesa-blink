"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/components/Nav";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPiloto = pathname?.startsWith("/piloto");

  if (isPiloto) {
    return <>{children}</>;
  }

  return (
    <div className="site-wrap">
      <Nav />
      {children}
      <footer className="site-footer">
        Remesa Blink — del norte al nopal.{" "}
        <a href="mailto:remesatia@gmail.com">remesatia@gmail.com</a>
        {" · "}
        Envía a tu familia con claridad; la wallet es opcional.
      </footer>
    </div>
  );
}
