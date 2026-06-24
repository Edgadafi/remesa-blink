import { MisRemesasLookup } from "@/components/MisRemesasLookup";

export default function MisRemesasPage() {
  return (
    <main className="site-main">
      <h1 className="page-title">Mis remesas</h1>
      <p className="lede">
        Consulta suscripciones activas donde eres remitente o destinatario (mismo criterio que el backend).
      </p>
      <MisRemesasLookup />
    </main>
  );
}
