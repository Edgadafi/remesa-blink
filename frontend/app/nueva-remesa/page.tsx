import { FormNuevaRemesa } from "@/components/FormNuevaRemesa";
import { HubPageIntro } from "@/components/HubPageIntro";
import { HubText } from "@/components/HubText";
import { Providers } from "@/app/providers";
import Link from "next/link";

export default function NuevaRemesaPage() {
  return (
    <main className="site-main">
      <HubPageIntro kicker="sendKicker" title="sendTitle" lede="sendLede" />
      <Providers>
        <FormNuevaRemesa />
      </Providers>
      <p className="muted" style={{ marginTop: "1.5rem" }}>
        <Link href="/">
          <HubText k="sendBack" />
        </Link>
      </p>
    </main>
  );
}
