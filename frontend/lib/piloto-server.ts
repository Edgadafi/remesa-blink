import { getSupabase, getSupabaseAdmin } from "./supabase-server";
import type { RegistroPilotoInput } from "./pilotos";

export type PilotoInsertResult = {
  whatsapp: string;
  rol: string;
  id?: string;
  created_at?: string;
  nombre_opcional?: string | null;
  estado?: string | null;
  municipio?: string | null;
  zona?: string | null;
  bancarizado?: string | null;
  canal_confianza?: string | null;
  canal_detalle?: string | null;
  notas?: string | null;
};

function rowPayload(data: RegistroPilotoInput) {
  return {
    whatsapp: data.whatsapp,
    rol: data.rol,
    nombre_opcional: data.nombre_opcional ?? null,
    genero: data.genero ?? null,
    edad_rango: data.edad_rango ?? null,
    estado: data.estado ?? null,
    municipio: data.municipio ?? null,
    zona: data.zona ?? null,
    bancarizado: data.bancarizado ?? null,
    canal_confianza: data.canal_confianza ?? null,
    canal_detalle: data.canal_detalle ?? null,
    referido_por_id: data.referido_por_id ?? null,
    wallet_solana: data.wallet_solana ?? null,
    notas: data.notas ?? null,
  };
}

function normalizePgConnectionString(raw: string): string {
  try {
    const url = new URL(raw);
    url.searchParams.set("sslmode", "no-verify");
    return url.toString();
  } catch {
    const sep = raw.includes("?") ? "&" : "?";
    return `${raw}${sep}sslmode=no-verify`;
  }
}

async function withPg<T>(fn: (client: import("pg").PoolClient) => Promise<T>): Promise<T> {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL not configured");
  }
  const { default: pg } = await import("pg");
  const pool = new pg.Pool({
    connectionString: normalizePgConnectionString(connectionString),
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 12_000,
  });
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
    await pool.end().catch(() => undefined);
  }
}

export async function countPilotos(): Promise<number> {
  if (process.env.DATABASE_URL?.trim()) {
    try {
      return await withPg(async (client) => {
        const res = await client.query<{ c: string }>(
          "SELECT COUNT(*)::text AS c FROM public.usuarios_piloto"
        );
        return Number(res.rows[0]?.c ?? 0);
      });
    } catch (err) {
      console.warn("[piloto] count via DATABASE_URL failed, trying Supabase RPC:", err);
    }
  }

  const { data, error } = await getSupabase().rpc("piloto_total");
  if (error) throw error;
  return typeof data === "number" ? data : 0;
}

export async function insertPiloto(data: RegistroPilotoInput): Promise<PilotoInsertResult> {
  const payload = rowPayload(data);

  if (process.env.DATABASE_URL?.trim()) {
    try {
      return await withPg(async (client) => {
        const res = await client.query(
          `INSERT INTO public.usuarios_piloto (
            whatsapp, rol, nombre_opcional, genero, edad_rango, estado, municipio,
            zona, bancarizado, canal_confianza, canal_detalle, referido_por_id,
            wallet_solana, notas
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
          RETURNING id, whatsapp, rol, created_at, nombre_opcional, estado, municipio,
            zona, bancarizado, canal_confianza, canal_detalle, notas`,
          [
            payload.whatsapp,
            payload.rol,
            payload.nombre_opcional,
            payload.genero,
            payload.edad_rango,
            payload.estado,
            payload.municipio,
            payload.zona,
            payload.bancarizado,
            payload.canal_confianza,
            payload.canal_detalle,
            payload.referido_por_id,
            payload.wallet_solana,
            payload.notas,
          ]
        );
        const row = res.rows[0];
        return {
          whatsapp: row.whatsapp,
          rol: row.rol,
          id: row.id,
          created_at: row.created_at,
          nombre_opcional: row.nombre_opcional,
          estado: row.estado,
          municipio: row.municipio,
          zona: row.zona,
          bancarizado: row.bancarizado,
          canal_confianza: row.canal_confianza,
          canal_detalle: row.canal_detalle,
          notas: row.notas,
        };
      });
    } catch (err) {
      console.warn("[piloto] insert via DATABASE_URL failed, trying Supabase:", err);
    }
  }

  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: row, error } = await admin
      .from("usuarios_piloto")
      .insert(payload)
      .select(
        "id, whatsapp, rol, created_at, nombre_opcional, estado, municipio, zona, bancarizado, canal_confianza, canal_detalle, notas"
      )
      .single();
    if (error) throw error;
    return {
      whatsapp: row.whatsapp,
      rol: row.rol,
      id: row.id,
      created_at: row.created_at,
      nombre_opcional: row.nombre_opcional,
      estado: row.estado,
      municipio: row.municipio,
      zona: row.zona,
      bancarizado: row.bancarizado,
      canal_confianza: row.canal_confianza,
      canal_detalle: row.canal_detalle,
      notas: row.notas,
    };
  }

  const { error } = await getSupabase().from("usuarios_piloto").insert(payload);
  if (error) throw error;
  return { whatsapp: data.whatsapp, rol: data.rol };
}
