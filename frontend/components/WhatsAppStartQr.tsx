"use client";

import { useLocale } from "@/components/LocaleProvider";

type Props = {
  waUrl: string;
  qrDataUrl: string;
  /** Caption under QR */
  caption?: string;
  /** Visual variant for /demo hero */
  variant?: "hero" | "stage";
};

/**
 * Inicio de interacción con TIA: el usuario escanea el QR → WhatsApp abre con "hola".
 */
export function WhatsAppStartQr({
  waUrl,
  qrDataUrl,
  caption,
  variant = "hero",
}: Props) {
  const { t } = useLocale();

  return (
    <figure className={`wa-qr wa-qr--${variant}`}>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-qr-frame"
        aria-label={t.qrAria}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          width={280}
          height={280}
          alt={t.qrAlt}
        />
      </a>
      <figcaption className="wa-qr-caption">{caption ?? t.qrCaption}</figcaption>
      <p className="wa-qr-steps">
        <span>{t.qrStep1}</span>
        <span aria-hidden>→</span>
        <span>{t.qrStep2}</span>
        <span aria-hidden>→</span>
        <span>{t.qrStep3}</span>
      </p>
      <a
        href={waUrl}
        className="wa-qr-fallback"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t.qrFallback}
      </a>
    </figure>
  );
}
