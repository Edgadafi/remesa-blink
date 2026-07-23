import { CashbackPanel } from "@/components/CashbackPanel";

export default function CashbackPage() {
  return (
    <main className="site-main wide">
      <p className="hub-kicker">Recompensas</p>
      <h1 className="page-title">Cashback</h1>
      <p className="lede">
        Revisa tu saldo, genera un código de referido y canjea — todo con tu WhatsApp.
      </p>
      <CashbackPanel />
    </main>
  );
}
