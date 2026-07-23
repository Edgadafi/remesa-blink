import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/nueva-remesa", label: "Enviar a mi familia", primary: true },
  { href: "/mis-remesas", label: "Mis remesas" },
  { href: "/cashback", label: "Cashback" },
];

export function Nav() {
  return (
    <header className="site-header">
      <Link href="/" className="site-logo">
        Remesa Blink
      </Link>
      <nav className="site-nav" aria-label="Principal">
        {links.map(({ href, label, primary }) => (
          <Link
            key={href}
            href={href}
            className={primary ? "site-nav-link site-nav-link-primary" : "site-nav-link"}
          >
            {label}
          </Link>
        ))}
      </nav>
      <WalletConnect />
    </header>
  );
}
