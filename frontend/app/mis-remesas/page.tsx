import { HubPageIntro } from "@/components/HubPageIntro";
import { MisRemesasLookup } from "@/components/MisRemesasLookup";

export default function MisRemesasPage() {
  return (
    <main className="site-main">
      <HubPageIntro kicker="transfersKicker" title="transfersTitle" lede="transfersLede" />
      <MisRemesasLookup />
    </main>
  );
}
