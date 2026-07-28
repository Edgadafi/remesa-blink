import type { RegistroPilotoInput } from "./pilotos";

const DEFAULT_NOTIFY_TO = "remesatia@gmail.com";

function formatPilotoEmail(data: RegistroPilotoInput & { id?: string; created_at?: string }) {
  const lines = [
    "Nuevo registro — programa piloto RemesaBlink",
    "",
    data.id ? `ID: ${data.id}` : null,
    `WhatsApp: ${data.whatsapp}`,
    `Rol: ${data.rol}`,
    data.nombre_opcional ? `Nombre: ${data.nombre_opcional}` : null,
    data.estado ? `Estado/ciudad: ${data.estado}` : null,
    data.municipio ? `Municipio: ${data.municipio}` : null,
    data.zona ? `Zona: ${data.zona}` : null,
    data.bancarizado ? `Bancarizado: ${data.bancarizado}` : null,
    data.canal_confianza ? `Canal: ${data.canal_confianza}` : null,
    data.canal_detalle ? `Detalle canal: ${data.canal_detalle}` : null,
    data.notas ? `Notas: ${data.notas}` : null,
    data.created_at ? `Fecha: ${data.created_at}` : null,
    "",
    "Ver todos: Supabase → remesa-blink → usuarios_piloto",
  ];
  return lines.filter(Boolean).join("\n");
}

/** Envía aviso a remesatia@gmail.com vía Resend (no bloquea el registro si falla). */
export async function notifyPilotoRegistered(
  data: RegistroPilotoInput & { id?: string; created_at?: string }
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.PILOTO_NOTIFY_EMAIL?.trim() || DEFAULT_NOTIFY_TO;

  if (!apiKey) {
    console.warn(`[piloto] RESEND_API_KEY ausente — no se envió email a ${to}`);
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }

  const from =
    process.env.RESEND_FROM?.trim() ?? "RemesaBlink Piloto <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `[Piloto] ${data.rol} — ${data.nombre_opcional ?? data.whatsapp}`,
        text: formatPilotoEmail(data),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[piloto] Resend error:", res.status, errText);
      return { sent: false, reason: `Resend ${res.status}` };
    }

    console.info(`[piloto] Email enviado a ${to}${data.id ? ` (id ${data.id})` : ""}`);
    return { sent: true };
  } catch (err) {
    console.error("[piloto] Email notify failed:", err);
    return { sent: false, reason: err instanceof Error ? err.message : "fetch failed" };
  }
}
