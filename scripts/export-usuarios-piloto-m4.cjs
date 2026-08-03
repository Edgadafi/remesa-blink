#!/usr/bin/env node
/**
 * Export usuarios_piloto for M4 Drive evidence.
 * Usage (from repo root or backend):
 *   node scripts/export-usuarios-piloto-m4.cjs
 * Reads DATABASE_URL from backend/.env
 */
const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");

const root = path.resolve(__dirname, "..");
const envPath = path.join(root, "backend", ".env");
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m && !process.env[m[1].trim()]) {
    process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

async function main() {
  const requireBackend = createRequire(path.join(root, "backend", "package.json"));
  const pg = requireBackend("pg");
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("supabase")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  const { rows } = await pool.query(
    `SELECT id, whatsapp, rol, nombre_opcional, genero, edad_rango, estado, municipio,
            zona, bancarizado, canal_confianza, canal_detalle, referido_por_id,
            wallet_solana, notas, created_at, updated_at
     FROM usuarios_piloto ORDER BY created_at ASC`
  );

  const outDir = path.join(root, "docs", "M4-evidencias");
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);

  const cols = [
    "id",
    "whatsapp",
    "rol",
    "nombre_opcional",
    "genero",
    "edad_rango",
    "estado",
    "municipio",
    "zona",
    "bancarizado",
    "canal_confianza",
    "canal_detalle",
    "referido_por_id",
    "wallet_solana",
    "notas",
    "created_at",
    "updated_at",
  ];

  function csvEscape(v) {
    if (v == null) return "";
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  function maskWa(wa) {
    const d = String(wa || "").replace(/\D/g, "");
    if (d.length < 8) return "***";
    return `${d.slice(0, 4)}…${d.slice(-4)}`;
  }

  const fullPath = path.join(outDir, `usuarios_piloto-export-${stamp}.csv`);
  const redPath = path.join(outDir, "usuarios_piloto-export-REDACTED.csv");

  const fullLines = [cols.join(",")];
  const redLines = [cols.join(",")];
  for (const r of rows) {
    fullLines.push(cols.map((c) => csvEscape(r[c])).join(","));
    redLines.push(
      cols
        .map((c) => csvEscape(c === "whatsapp" ? maskWa(r.whatsapp) : r[c]))
        .join(",")
    );
  }
  fs.writeFileSync(fullPath, fullLines.join("\n") + "\n", "utf8");
  fs.writeFileSync(redPath, redLines.join("\n") + "\n", "utf8");

  const byRol = {};
  const byZona = {};
  for (const r of rows) {
    byRol[r.rol] = (byRol[r.rol] || 0) + 1;
    byZona[r.zona || "null"] = (byZona[r.zona || "null"] || 0) + 1;
  }

  console.log(
    JSON.stringify(
      {
        total: rows.length,
        byRol,
        byZona,
        full: path.relative(root, fullPath),
        redacted: path.relative(root, redPath),
      },
      null,
      2
    )
  );

  // Prefer not committing full PII: delete full from workspace tip if CI
  if (process.env.M4_EXPORT_DELETE_FULL === "1") {
    fs.unlinkSync(fullPath);
    console.log("Deleted full export (M4_EXPORT_DELETE_FULL=1)");
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
