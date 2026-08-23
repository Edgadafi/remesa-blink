"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DeferredWallet } from "@/components/DeferredWallet";
import { LangSwitch } from "@/components/LangSwitch";
import { useLocale } from "@/components/LocaleProvider";
import { HolatiaMark } from "@/components/HolatiaMark";

function isActivePath(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav({ landing = false }: { landing?: boolean }) {
  const pathname = usePathname() || "/";
  const { t } = useLocale();

  const links = [
    { href: "/", label: t.navHome },
    { href: "/empezar", label: t.navStart, primary: true },
    { href: "/nueva-remesa", label: t.navSend },
    { href: "/mis-remesas", label: t.navTransfers },
    { href: "/cashback", label: t.navCashback },
  ];

  return (
    <header className={landing ? "site-header site-header--landing" : "site-header"}>
      <Link href="/" className="site-logo" aria-label={t.logoAlt}>
        <HolatiaMark className="site-logo-mark" />
        <span className="site-logo-word">
          <span className="site-logo-hola">hola</span>
          <span className="site-logo-tia">tia</span>
        </span>
      </Link>
      <nav className="site-nav" aria-label={t.navAria}>
        {links.map(({ href, label, primary }) => {
          const active = isActivePath(href, pathname);
          const classes = [
            "site-nav-link",
            primary ? "site-nav-link-primary" : "",
            active ? "site-nav-link-active" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <Link
              key={href}
              href={href}
              className={classes}
              aria-current={active ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="site-header-actions">
        <LangSwitch />
        <DeferredWallet />
      </div>
    </header>
  );
}
