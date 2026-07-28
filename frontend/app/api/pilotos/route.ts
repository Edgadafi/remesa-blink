import { NextResponse } from "next/server";
import { countPilotos, insertPiloto } from "@/lib/piloto-server";
import { notifyPilotoRegistered } from "@/lib/notify-piloto-email";
import type { RegistroPilotoInput } from "@/lib/pilotos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLES = ["remitente", "receptora", "promotor", "tiendita"] as const;
const ZONAS = ["rural", "semiurbana", "urbana"] as const;
const BANCARIZADO = ["si", "no", "sub"] as const;
const CANALES = [
  "tiendita",
  "comerciantes",
  "pyme",
  "asociacion_migrante",
  "iglesia",
  "asociacion",
  "familia",
  "microfinanzas",
  "otro",
] as const;

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function parseBody(body: unknown): RegistroPilotoInput | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Cuerpo inválido" };
  }
  const b = body as Record<string, unknown>;
  const whatsapp = typeof b.whatsapp === "string" ? b.whatsapp.replace(/\D/g, "") : "";
  if (whatsapp.length < 10 || whatsapp.length > 50) {
    return { error: "WhatsApp inválido" };
  }
  if (!isOneOf(b.rol, ROLES)) {
    return { error: "Rol inválido" };
  }
  const out: RegistroPilotoInput = { whatsapp, rol: b.rol };
  if (typeof b.nombre_opcional === "string" && b.nombre_opcional.trim()) {
    out.nombre_opcional = b.nombre_opcional.trim().slice(0, 120);
  }
  if (typeof b.estado === "string" && b.estado.trim()) out.estado = b.estado.trim().slice(0, 80);
  if (typeof b.municipio === "string" && b.municipio.trim()) {
    out.municipio = b.municipio.trim().slice(0, 120);
  }
  if (isOneOf(b.zona, ZONAS)) out.zona = b.zona;
  if (isOneOf(b.bancarizado, BANCARIZADO)) out.bancarizado = b.bancarizado;
  if (isOneOf(b.canal_confianza, CANALES)) out.canal_confianza = b.canal_confianza;
  if (typeof b.canal_detalle === "string" && b.canal_detalle.trim()) {
    out.canal_detalle = b.canal_detalle.trim().slice(0, 500);
  }
  if (typeof b.referido_por_id === "string" && b.referido_por_id.trim()) {
    out.referido_por_id = b.referido_por_id.trim();
  }
  if (typeof b.notas === "string" && b.notas.trim()) {
    out.notas = b.notas.trim().slice(0, 2000);
  }
  return out;
}

export async function GET() {
  try {
    const total = await countPilotos();
    return NextResponse.json({ total });
  } catch (err) {
    console.error("GET /api/pilotos:", err);
    const detail =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : undefined;
    return NextResponse.json(
      { error: "Error al consultar pilotos", ...(detail ? { detail } : {}) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const parsed = parseBody(await req.json());
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const usuario = await insertPiloto(parsed);
    const email_notify = await notifyPilotoRegistered({
      ...parsed,
      id: usuario.id,
      created_at: usuario.created_at,
    });
    return NextResponse.json(
      {
        ok: true,
        usuario,
        email_notify,
        stored_in: "supabase.usuarios_piloto",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/pilotos:", err);
    const detail =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : undefined;
    return NextResponse.json(
      { error: "Error al registrar piloto", ...(detail ? { detail } : {}) },
      { status: 500 }
    );
  }
}
