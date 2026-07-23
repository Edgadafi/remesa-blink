import { MisRemesasLookup } from "@/components/MisRemesasLookup";

export default function MisRemesasPage() {
  return (
    <main className="site-main">
      <p className="hub-kicker">Tus envíos</p>
      <h1 className="page-title">Mis remesas</h1>
      <p className="lede">
        Consulta lo que envías o recibes con tu número de WhatsApp — el mismo que usas en el bot.
      </p>
      <MisRemesasLookup />
    </main>
  );
}
