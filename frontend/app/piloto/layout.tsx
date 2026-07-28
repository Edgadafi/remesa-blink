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
  title: "Remesa + Solana Blink + WhatsApp + IA — Programa piloto",
  description: `${PILOTO_META_GOAL} familias piloto · CAN-EU-MX corridor. Remesas por WhatsApp. | ${PILOTO_META_GOAL} pilot families · Recurring remittances via WhatsApp.`,
  openGraph: {
    title: "Remesa + Solana Blink + WhatsApp + IA",
    description: `${PILOTO_META_GOAL} familias piloto · CAN-EU-MX. | ${PILOTO_META_GOAL} pilot families.`,
    url: "https://frontend-bay-phi-92.vercel.app/piloto",
    locale: "es_MX",
    alternateLocale: "en_US",
    type: "website",
    images: [{ url: "/piloto/hero-banner.png", width: 1200, height: 630, alt: "Remesa Solana Blink WhatsApp IA" }],
  },
};

export default function PilotoLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${serif.variable} ${mono.variable}`}>{children}</div>;
}
