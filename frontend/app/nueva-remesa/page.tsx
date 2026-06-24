import { FormNuevaRemesa } from "@/components/FormNuevaRemesa";

export default function NuevaRemesaPage() {
  return (
    <main className="site-main">
      <h1 className="page-title">Nueva remesa</h1>
      <p className="lede">
        Crea una suscripción recurrente on-chain + registro en base de datos. Usa los mismos datos que enviarías por{" "}
        <code>/recurrente</code> al bot.
      </p>
      <FormNuevaRemesa />
    </main>
  );
}
