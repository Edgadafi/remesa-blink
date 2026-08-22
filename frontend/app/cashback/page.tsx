import { CashbackPanel } from "@/components/CashbackPanel";
import { HubPageIntro } from "@/components/HubPageIntro";

export default function CashbackPage() {
  return (
    <main className="site-main wide">
      <HubPageIntro kicker="cashbackKicker" title="cashbackTitle" lede="cashbackLede" />
      <CashbackPanel />
    </main>
  );
}
