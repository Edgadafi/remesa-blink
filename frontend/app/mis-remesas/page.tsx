import { HubPageIntro } from "@/components/HubPageIntro";
import { MisRemesasLookup } from "@/components/MisRemesasLookup";

export default function MisRemesasPage() {
  return (
    <main className="site-main landing-main hub-product">
      <section className="landing-hero-shell hub-product-shell">
        <HubPageIntro kicker="transfersKicker" title="transfersTitle" lede="transfersLede" />
        <MisRemesasLookup />
      </section>
    </main>
  );
}
