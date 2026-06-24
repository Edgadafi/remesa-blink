import { CashbackPanel } from "@/components/CashbackPanel";

export default function CashbackPage() {
  return (
    <main className="site-main wide">
      <h1 className="page-title">Cashback</h1>
      <p className="lede">
        Resumen por WhatsApp, generar código de referido, canjear y registrar un código como referido.
      </p>
      <CashbackPanel />
    </main>
  );
}
