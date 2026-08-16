import QRCode from "qrcode";

/** Data URL PNG del QR (servidor). Colores brand: Tierra sobre Papel. */
export async function toQrDataUrl(
  payload: string,
  size = 280
): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "M",
    color: {
      dark: "#2C2416",
      light: "#F5F0E8",
    },
  });
}
