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
  caption = "Escanea con tu teléfono · se abre WhatsApp con TIA",
  variant = "hero",
}: Props) {
  return (
    <figure className={`wa-qr wa-qr--${variant}`}>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-qr-frame"
        aria-label="Abrir WhatsApp con TIA (o escanea el código)"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          width={280}
          height={280}
          alt="Código QR para iniciar chat con Remesa Blink + TIA en WhatsApp"
        />
      </a>
      <figcaption className="wa-qr-caption">{caption}</figcaption>
      <p className="wa-qr-steps">
        <span>1. Escanea</span>
        <span aria-hidden>→</span>
        <span>2. Envía <em>hola</em></span>
        <span aria-hidden>→</span>
        <span>3. Escribe <em>enviar</em></span>
      </p>
      <a
        href={waUrl}
        className="wa-qr-fallback"
        target="_blank"
        rel="noopener noreferrer"
      >
        ¿En el mismo teléfono? Toca aquí
      </a>
    </figure>
  );
}
