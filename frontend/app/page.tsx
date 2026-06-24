import Link from "next/link";
import { getBlinksBase } from "@/lib/config";

export default function Home() {
  const blinkBase = getBlinksBase();

  const blinkLinks = [
    { href: `${blinkBase}/api/actions/remesa`, label: "Blink: Remesa SOL", desc: "Enviar SOL (Solana Action)." },
    { href: `${blinkBase}/api/actions/enviar-remesa-usdc`, label: "Blink: Remesa USDC", desc: "Enviar USDC." },
    { href: `${blinkBase}/api/actions/convertir-mxn`, label: "Blink: USDC → MXN", desc: "Off-ramp Etherfuse." },
    { href: `${blinkBase}/api/actions/onboarding-mxn`, label: "Blink: Onboarding MXN", desc: "KYC / CLABE." },
  ];

  return (
    <main className="site-main wide">
      <h1 className="page-title">Remesa Blink</h1>
      <p className="lede">
        Configura remesas recurrentes, consulta estado y cashback. Conecta tu wallet (devnet) en la
        barra superior. Los datos se enlazan con tu número de WhatsApp, igual que en el bot.
      </p>

      <nav className="link-cards" aria-label="Acciones">
        <Link href="/nueva-remesa" className="link-card">
          <strong>Nueva remesa recurrente</strong>
          <span>Monto, SOL/USDC, frecuencia, destinatario y wallet.</span>
        </Link>
        <Link href="/mis-remesas" className="link-card">
          <strong>Mis remesas</strong>
          <span>Listado por tu WhatsApp.</span>
        </Link>
        <Link href="/cashback" className="link-card">
          <strong>Cashback</strong>
          <span>Saldo, código de referido, canje y registro de referido.</span>
        </Link>
      </nav>

      <h2 className="h-small" style={{ marginTop: "2.5rem" }}>
        Blinks (abren metadata GET; firma en wallet)
      </h2>
      <ul className="link-cards">
        {blinkLinks.map((b) => (
          <li key={b.href}>
            <a href={b.href} className="link-card" target="_blank" rel="noopener noreferrer">
              <strong>{b.label}</strong>
              <span>{b.desc}</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
