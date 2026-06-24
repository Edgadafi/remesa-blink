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
        MVP — wallet vía Wallet Standard (devnet). Remesas enlazadas por WhatsApp.
      </footer>
    </div>
  );
}
