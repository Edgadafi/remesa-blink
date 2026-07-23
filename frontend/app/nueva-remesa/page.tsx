import { FormNuevaRemesa } from "@/components/FormNuevaRemesa";
import Link from "next/link";

export default function NuevaRemesaPage() {
  return (
    <main className="site-main">
      <p className="hub-kicker">Envío a familia</p>
      <h1 className="page-title">Enviar a mi familia</h1>
      <p className="lede">
        Define monto, frecuencia y WhatsApp. Tu familia recibe el aviso cuando toca el envío — sin
        jerga de blockchain en el camino.
      </p>
      <FormNuevaRemesa />
      <p className="muted" style={{ marginTop: "1.5rem" }}>
        <Link href="/">← Volver al inicio</Link>
      </p>
    </main>
  );
}
