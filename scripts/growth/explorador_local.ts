import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import { config as loadDotenv } from "dotenv";
import { Client } from "@googlemaps/google-maps-services-js";
import { createObjectCsvWriter } from "csv-writer";

const __dirname = dirname(fileURLToPath(import.meta.url));

loadDotenv({ path: resolve(__dirname, ".env") });

const DEFAULT_QUERIES = [
  "Abarrotes en Sahuayo, Michoacán",
  "Cibercafé en Lagos de Moreno, Jalisco",
  "Miscelánea en Silao, Guanajuato",
] as const;

const DETAILS_FIELDS = [
  "name",
  "formatted_address",
  "formatted_phone_number",
  "international_phone_number",
] as const;

const THROTTLE_MS_MIN = 200;
const THROTTLE_MS_MAX = 300;

interface Prospecto {
  nombre: string;
  direccion: string;
  telefono: string;
  municipio: string;
  query: string;
  whatsAppLink: string;
  placeId: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function throttleDelayMs(): number {
  return (
    THROTTLE_MS_MIN +
    Math.floor(Math.random() * (THROTTLE_MS_MAX - THROTTLE_MS_MIN + 1))
  );
}

/**
 * Normalize MX phone to WhatsApp digits (521XXXXXXXXXX).
 * Returns null if invalid.
 */
export function formatMxWhatsApp(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.length === 10) {
    return `521${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("52")) {
    // 52 + 10-digit national → insert 1 for mobile WA
    return `521${digits.slice(2)}`;
  }

  if (digits.length === 13 && digits.startsWith("521")) {
    return digits;
  }

  return null;
}

function municipioFromQuery(query: string): string {
  const match = query.match(/\ben\s+(.+)$/i);
  return match?.[1]?.trim() ?? query.trim();
}

function buildWhatsAppLink(
  digits: string,
  nombre: string,
  municipio: string,
): string {
  const text = `Hola, ${nombre}. Soy desarrollador de una plataforma para que las familias de ${municipio} reciban dinero de Estados Unidos sin comisiones y directo al celular. Busco una tiendita de confianza en la zona para que sea nuestro punto oficial de ayuda y se lleve una comisión por cada remesa. ¿Les interesa platicar 5 minutos?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function resolveQueries(argv: string[]): string[] {
  const fromCli = argv.slice(2).map((q) => q.trim()).filter(Boolean);
  if (fromCli.length > 0) return fromCli;

  const fromEnv = process.env.QUERIES?.split("|").map((q) => q.trim()).filter(Boolean);
  if (fromEnv && fromEnv.length > 0) return fromEnv;

  return [...DEFAULT_QUERIES];
}

async function main(): Promise<void> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "Missing GOOGLE_PLACES_API_KEY. Copy .env.example to .env and set your key.",
    );
    process.exit(1);
  }

  const maxPerQuery = Number.parseInt(
    process.env.MAX_RESULTS_PER_QUERY ?? "10",
    10,
  );
  if (!Number.isFinite(maxPerQuery) || maxPerQuery < 1) {
    console.error("MAX_RESULTS_PER_QUERY must be a positive integer.");
    process.exit(1);
  }

  const outputCsv = resolve(
    __dirname,
    process.env.OUTPUT_CSV?.trim() || "./out/prospectos_aliados.csv",
  );

  const queries = resolveQueries(process.argv);
  const client = new Client({});

  const byPhone = new Map<string, Prospecto>();
  const seenPlaceIds = new Set<string>();

  for (const query of queries) {
    const municipio = municipioFromQuery(query);
    console.log(`\n→ TextSearch: ${query}`);

    const searchRes = await client.textSearch({
      params: {
        query,
        key: apiKey,
      },
    });

    const results = (searchRes.data.results ?? []).slice(0, maxPerQuery);
    console.log(`  ${results.length} place(s) (cap ${maxPerQuery})`);

    for (const place of results) {
      const placeId = place.place_id;
      if (!placeId) continue;
      if (seenPlaceIds.has(placeId)) continue;

      await sleep(throttleDelayMs());

      const detailsRes = await client.placeDetails({
        params: {
          place_id: placeId,
          fields: [...DETAILS_FIELDS],
          key: apiKey,
        },
      });

      const details = detailsRes.data.result;
      if (!details) continue;

      const rawPhone =
        details.international_phone_number ??
        details.formatted_phone_number ??
        "";
      if (!rawPhone.trim()) {
        console.log(`  skip (no phone): ${details.name ?? placeId}`);
        continue;
      }

      const waDigits = formatMxWhatsApp(rawPhone);
      if (!waDigits) {
        console.log(
          `  skip (invalid MX phone): ${details.name ?? placeId} (${rawPhone})`,
        );
        continue;
      }

      if (byPhone.has(waDigits)) {
        seenPlaceIds.add(placeId);
        console.log(`  skip (dup phone): ${details.name ?? placeId}`);
        continue;
      }

      const nombre = details.name?.trim() || "Negocio";
      const prospecto: Prospecto = {
        nombre,
        direccion: details.formatted_address?.trim() ?? "",
        telefono: waDigits,
        municipio,
        query,
        whatsAppLink: buildWhatsAppLink(waDigits, nombre, municipio),
        placeId,
      };

      byPhone.set(waDigits, prospecto);
      seenPlaceIds.add(placeId);
      console.log(`  + ${nombre} → ${waDigits}`);
    }
  }

  const rows = [...byPhone.values()].map(
    ({ placeId: _placeId, ...csvRow }) => csvRow,
  );

  await mkdir(dirname(outputCsv), { recursive: true });

  const writer = createObjectCsvWriter({
    path: outputCsv,
    header: [
      { id: "nombre", title: "nombre" },
      { id: "direccion", title: "direccion" },
      { id: "telefono", title: "telefono" },
      { id: "municipio", title: "municipio" },
      { id: "query", title: "query" },
      { id: "whatsAppLink", title: "whatsAppLink" },
    ],
  });

  await writer.writeRecords(rows);
  console.log(`\nWrote ${rows.length} prospect(s) → ${outputCsv}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
