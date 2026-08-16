"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DeferredWallet } from "@/components/DeferredWallet";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/empezar", label: "Empezar", primary: true },
  { href: "/nueva-remesa", label: "Enviar a mi familia" },
  { href: "/mis-remesas", label: "Mis remesas" },
  { href: "/cashback", label: "Cashback" },
];

function isActivePath(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname() || "/";

  return (
    <header className="site-header">
      <Link href="/" className="site-logo">
        Remesa Blink
      </Link>
      <nav className="site-nav" aria-label="Principal">
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
      <DeferredWallet />
    </header>
  );
}
