#!/usr/bin/env node
/**
 * Extrae diagramas Mermaid de ARCHITECTURE-M3.md → PNG en docs/M3-evidencias/diagrams/
 * Uso: npm run docs:diagrams:m3
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const MMDC = join(root, "node_modules/.bin/mmdc");

const MD_PATH = join(root, "docs/ARCHITECTURE-M3.md");
const OUT_DIR = join(root, "docs/M3-evidencias/diagrams");
const THEME = join(root, "docs/brand/mermaid-theme.json");

// Orden = aparición de ```mermaid en ARCHITECTURE-M3.md
const DIAGRAM_NAMES = [
  "m3-08-capa-confianza",
  "m3-01-vista-contexto",
  "m3-02-flujo-e2e",
  "m3-09-capa-composabilidad",
  "m3-03-mvp-custodia-keeper",
  "m3-04-fase-e-nocustodial",
  "m3-05-wa-blink-flujo",
  "m3-06-fallback-ux",
  "m3-07-despliegue-devnet",
];


function extractMermaidBlocks(md) {
  const re = /```mermaid\n([\s\S]*?)```/g;
  const blocks = [];
  let m;
  while ((m = re.exec(md)) !== null) {
    blocks.push(m[1].trim());
  }
  return blocks;
}

function renderOne(mmdPath, pngPath) {
  if (!existsSync(MMDC)) {
    throw new Error(
      "Falta @mermaid-js/mermaid-cli. Ejecuta: npm install --save-dev @mermaid-js/mermaid-cli@11"
    );
  }
  execFileSync(
    MMDC,
    [
      "-i",
      mmdPath,
      "-o",
      pngPath,
      "-c",
      THEME,
      "-b",
      "#F5F0E8",
      "-w",
      "1400",
      "-H",
      "900",
      "--scale",
      "2",
    ],
    { stdio: "inherit", cwd: root, timeout: 180000 }
  );
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const md = readFileSync(MD_PATH, "utf8");
  const blocks = extractMermaidBlocks(md);

  if (blocks.length !== DIAGRAM_NAMES.length) {
    console.warn(
      `Aviso: ${blocks.length} bloques mermaid vs ${DIAGRAM_NAMES.length} nombres esperados`
    );
  }

  const manifest = [];

  blocks.forEach((code, i) => {
    const name = DIAGRAM_NAMES[i] ?? `m3-${String(i + 1).padStart(2, "0")}-diagrama`;
    const mmdPath = join(OUT_DIR, `${name}.mmd`);
    const pngPath = join(OUT_DIR, `${name}.png`);
    writeFileSync(mmdPath, code, "utf8");
    console.log("Render:", name);
    renderOne(mmdPath, pngPath);
    if (!existsSync(pngPath)) {
      throw new Error(`No se generó ${pngPath}`);
    }
    manifest.push({ name, png: `diagrams/${name}.png`, mmd: `diagrams/${name}.mmd` });
  });

  writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log(`OK: ${blocks.length} diagramas en ${OUT_DIR}`);
}

main();
