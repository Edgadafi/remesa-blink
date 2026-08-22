"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/components/Nav";
import { DeferredCorridor } from "@/components/scene3d/DeferredCorridor";
import { useLocale } from "@/components/LocaleProvider";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLocale();
  const isPiloto = pathname?.startsWith("/piloto");
  const isDemo = pathname?.startsWith("/demo");
  const isEmpezar = pathname?.startsWith("/empezar");
  const isIntro = pathname?.startsWith("/intro");

  /* Escenas full-bleed sin chrome del hub */
  if (isPiloto || isDemo || isEmpezar || isIntro) {
    return <>{children}</>;
  }

  return (
    <div className="site-wrap">
      <DeferredCorridor />
      <Nav />
      {children}
      <footer className="site-footer">
        {t.footerTagline}{" "}
        <a href="mailto:remesatia@gmail.com">remesatia@gmail.com</a>
        {" · "}
        {t.footerNote}
      </footer>
    </div>
  );
}
