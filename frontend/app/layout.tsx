import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { EB_Garamond, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";
import { Providers } from "@/app/providers";

const body = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  style: ["normal", "italic"],
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const displayFontStyle = {
  ["--font-display"]: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif',
} as CSSProperties;

export const metadata: Metadata = {
  title: "Remesa Blink — Envía a tu familia",
  description:
    "Programa remesas a México. Tu familia recibe el aviso por WhatsApp. Send dollars, recibe pesos más cerca de tu familia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${body.variable} ${mono.variable}`} style={displayFontStyle}>
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
