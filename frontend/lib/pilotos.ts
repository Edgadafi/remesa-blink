import { apiFetch } from "./api";

export type RolPiloto = "remitente" | "receptora" | "promotor" | "tiendita";
export type ZonaPiloto = "rural" | "semiurbana" | "urbana";
export type BancarizadoPiloto = "si" | "no" | "sub";
export type CanalConfianza =
  | "tiendita"
  | "comerciantes"
  | "pyme"
  | "asociacion_migrante"
  | "iglesia"
  | "asociacion"
  | "familia"
  | "microfinanzas"
  | "otro";

export type RegistroPilotoInput = {
  whatsapp: string;
  rol: RolPiloto;
  nombre_opcional?: string;
  genero?: "femenino" | "masculino" | "otro" | "prefiero_no_decir";
  edad_rango?: string;
  estado?: string;
  municipio?: string;
  zona?: ZonaPiloto;
  bancarizado?: BancarizadoPiloto;
  canal_confianza?: CanalConfianza;
  canal_detalle?: string;
  referido_por_id?: string;
  wallet_solana?: string;
  notas?: string;
};

export async function fetchPilotosTotal(): Promise<number> {
  const data = await apiFetch<{ total: number }>("/api/pilotos");
  return data.total;
}

export async function registrarPiloto(body: RegistroPilotoInput): Promise<unknown> {
  return apiFetch("/api/pilotos", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
