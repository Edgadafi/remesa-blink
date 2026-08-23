"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";
import { DeferredCorridor } from "@/components/scene3d/DeferredCorridor";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPiloto = pathname?.startsWith("/piloto");
  const isDemo = pathname?.startsWith("/demo");
  const isIntro = pathname?.startsWith("/intro");
  const isBlink = pathname?.startsWith("/blink");
  const isLanding = pathname === "/";
  const isExport = pathname?.startsWith("/exports");
  const isHubProduct =
    pathname?.startsWith("/empezar") ||
    pathname?.startsWith("/nueva-remesa") ||
    pathname?.startsWith("/mis-remesas") ||
    pathname?.startsWith("/cashback");
  const usesLandingChrome = isLanding || isHubProduct;

  /* Escenas full-bleed sin chrome del hub */
  if (isPiloto || isDemo || isIntro || isExport) {
    return <>{children}</>;
  }

  const wrapClass = [
    "site-wrap",
    isBlink ? "site-wrap--blink" : "",
    usesLandingChrome ? "site-wrap--landing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapClass}>
      {!isBlink && !usesLandingChrome && <DeferredCorridor />}
      <Nav landing={usesLandingChrome} />
      {children}
      <SiteFooter />
    </div>
  );
}
