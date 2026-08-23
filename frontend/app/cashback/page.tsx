import { CashbackPanel } from "@/components/CashbackPanel";
import { HubPageIntro } from "@/components/HubPageIntro";

export default function CashbackPage() {
  return (
    <main className="site-main landing-main hub-product hub-product--wide">
      <section className="landing-hero-shell hub-product-shell">
        <HubPageIntro kicker="cashbackKicker" title="cashbackTitle" lede="cashbackLede" />
        <CashbackPanel />
      </section>
    </main>
  );
}
