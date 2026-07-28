import { PilotoLanding } from "@/components/piloto/PilotoLanding";

type SearchParams = { ref?: string; referido?: string; lang?: string };

export default function PilotoPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <PilotoLanding
      refParam={searchParams.ref}
      referidoId={searchParams.referido}
      initialLang={searchParams.lang}
    />
  );
}
