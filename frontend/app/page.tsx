import Link from "next/link";
import { getBlinksBase } from "@/lib/config";

export default function Home() {
  const blinkBase = getBlinksBase();

  const blinkLinks = [
    { href: `${blinkBase}/api/actions/remesa`, label: "Remesa SOL", desc: "Acción avanzada (firma en wallet)." },
    { href: `${blinkBase}/api/actions/enviar-remesa-usdc`, label: "Remesa USDC", desc: "Acción avanzada." },
    { href: `${blinkBase}/api/actions/convertir-mxn`, label: "USDC → MXN", desc: "Off-ramp (avanzado)." },
    { href: `${blinkBase}/api/actions/onboarding-mxn`, label: "Onboarding MXN", desc: "KYC / CLABE (avanzado)." },
  ];

  return (
    <main className="site-main wide">
      <section className="hub-hero" aria-labelledby="hub-title">
        <p className="hub-kicker">Send dollars, recibe pesos más cerca de tu familia.</p>
        <h1 id="hub-title" className="page-title">
          Tu familia más cerca, cada mes
        </h1>
        <p className="hub-story">
          Programa una vez desde el norte. Tu familia recibe el aviso por WhatsApp — sin filas en la
          tiendita.
        </p>
        <div className="hub-cta-row">
          <Link href="/nueva-remesa" className="btn-primary">
            Enviar a mi familia
          </Link>
          <Link href="/mis-remesas" className="btn-secondary">
            Ver mis envíos
          </Link>
        </div>
        <p className="hub-reassure">
          Claridad primero: monto, frecuencia y contacto. La wallet es opcional y va en segundo plano.
        </p>
      </section>

      <ol className="hub-steps" aria-label="Cómo funciona">
        <li>
          <span className="hub-step-num" aria-hidden>
            01
          </span>
          <div>
            <strong>Tú mandas desde lejos</strong>
            <span>WhatsApp + un formulario claro, en minutos.</span>
          </div>
        </li>
        <li>
          <span className="hub-step-num" aria-hidden>
            02
          </span>
          <div>
            <strong>Confirmamos el camino</strong>
            <span>Pago verificable en segundos cuando toca el envío.</span>
          </div>
        </li>
        <li>
          <span className="hub-step-num" aria-hidden>
            03
          </span>
          <div>
            <strong>Tu familia cobra en México</strong>
            <span>Aviso directo y link seguro — pesos cerca de ellos.</span>
          </div>
        </li>
      </ol>

      <nav className="hub-secondary" aria-label="Otras opciones">
        <Link href="/mis-remesas" className="hub-secondary-card">
          <strong>Mis remesas</strong>
          <span>Consulta envíos con tu número de WhatsApp.</span>
        </Link>
        <Link href="/cashback" className="hub-secondary-card">
          <strong>Cashback y referidos</strong>
          <span>Saldo, código de referido y canjes.</span>
        </Link>
      </nav>

      <details className="hub-advanced">
        <summary>Opciones avanzadas (wallet / Blinks)</summary>
        <p className="muted" style={{ marginBottom: "0.85rem" }}>
          Para quien ya usa Solana Actions. La mayoría solo necesita «Enviar a mi familia».
        </p>
        <ul className="hub-blinks">
          {blinkLinks.map((b) => (
            <li key={b.href}>
              <a href={b.href} target="_blank" rel="noopener noreferrer">
                <strong>{b.label}</strong>
                <span>{b.desc}</span>
              </a>
            </li>
          ))}
        </ul>
      </details>
    </main>
  );
}
