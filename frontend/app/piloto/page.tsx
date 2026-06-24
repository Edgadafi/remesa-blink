import { PilotoLanding } from "@/components/piloto/PilotoLanding";

type SearchParams = { ref?: string; referido?: string };

export default function PilotoPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <PilotoLanding refParam={searchParams.ref} referidoId={searchParams.referido} />
  );
}
