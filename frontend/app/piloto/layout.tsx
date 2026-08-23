import type { Metadata } from "next";
import { EB_Garamond, IBM_Plex_Mono } from "next/font/google";
import { PILOTO_META_GOAL } from "@/lib/piloto-config";
import "./piloto.css";

const serif = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "holatia — Programa piloto · Tu esfuerzo, directo a casa",
  description: `${PILOTO_META_GOAL} familias piloto corredor EE.UU. → México. Piloto $0 · objetivo 1.5% mainnet. Remesas recurrentes por WhatsApp con comprobante verificable.`,
  openGraph: {
    title: "holatia — Programa piloto",
    description: `${PILOTO_META_GOAL} familias piloto · corredor US–MX · WhatsApp + Solana`,
    url: "https://holatia.app/piloto",
    locale: "es_MX",
    alternateLocale: "en_US",
    type: "website",
    images: [{ url: "/piloto/hero-banner.png", width: 1200, height: 630, alt: "holatia remesas WhatsApp" }],
  },
};

export default function PilotoLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${serif.variable} ${mono.variable}`}>{children}</div>;
}
