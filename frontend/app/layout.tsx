import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { EB_Garamond, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/components/LocaleProvider";
import { SiteShell } from "@/components/SiteShell";

const body = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const ui = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ui",
  display: "swap",
  preload: false,
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

const displayFontStyle = {
  ["--font-display"]: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif',
} as CSSProperties;

export const metadata: Metadata = {
  title: "holatia — Tu esfuerzo, directo a casa",
  description:
    "Envía dinero a México desde WhatsApp. Piloto $0 · objetivo 1.5% mainnet. Programa una vez; tu familia recibe aviso con comprobante verificable.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${body.variable} ${ui.variable} ${mono.variable}`} style={displayFontStyle}>
        <LocaleProvider>
          <SiteShell>{children}</SiteShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
