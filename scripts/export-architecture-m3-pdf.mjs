#!/usr/bin/env node
/**
 * Exporta docs/ARCHITECTURE-M3.md → PDF (brand kit + diagramas PNG)
 * Uso: npm run docs:pdf:m3
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const TAGLINE = "Dollars in / Pesos en casa";

const MD_PATH = join(root, "docs/ARCHITECTURE-M3.md");
const CSS_PATH = join(root, "docs/brand/pdf-base.css");
const OUT_DIR = join(root, "docs/M3-evidencias");
const DIAGRAMS_DIR = join(OUT_DIR, "diagrams");
const OUT_PDF = join(OUT_DIR, "RemesaBlink-Architecture-M3.pdf");
const OUT_HTML = join(OUT_DIR, "RemesaBlink-Architecture-M3.html");

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


const ESCUDO_SVG = `<svg viewBox="0 0 120 48" xmlns="http://www.w3.org/2000/svg"><path d="M60 6c-8 4-14 12-14 20 0 2 1 4 2 5l12-8 12 8c1-1 2-3 2-5 0-8-6-16-14-20z" fill="#C9A227" opacity="0.9"/><path d="M48 28c4 6 8 10 12 12 4-2 8-6 12-12-3 2-6 3-12 3s-9-1-12-3z" fill="#2D5016"/><ellipse cx="52" cy="34" rx="2.5" ry="3" fill="#C45C3E"/><ellipse cx="60" cy="36" rx="2.5" ry="3" fill="#C45C3E"/><ellipse cx="68" cy="34" rx="2.5" ry="3" fill="#C45C3E"/><path d="M38 24h44M32 24h2M86 24h2" stroke="#C9A227" stroke-width="1.5" stroke-linecap="round"/></svg>`;

const WIN_TEMP = "/mnt/c/Users/edgar/AppData/Local/Temp/remesablink-m3-export";
const WIN_TEMP_HTML = join(WIN_TEMP, "RemesaBlink-Architecture-M3.html");
const WIN_TEMP_PDF_ARG = "C:\\Users\\edgar\\AppData\\Local\\Temp\\remesablink-m3-export\\RemesaBlink-Architecture-M3.pdf";
const WIN_TEMP_HTML_URL =
  "file:///C:/Users/edgar/AppData/Local/Temp/remesablink-m3-export/RemesaBlink-Architecture-M3.html";

const EDGE_PATHS = [
  "/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/mnt/c/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
];

function parseCoverMeta(md) {
  const tableBlock = md.match(/\| Campo[\s\S]*?\| \*\*Clasificación\*\*[\s\S]*?\|/);
  const rows = {};
  if (tableBlock) {
    for (const line of tableBlock[0].split("\n")) {
      const m = line.match(/\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|/);
      if (m) rows[m[1].trim()] = m[2].trim();
    }
  }
  return rows;
}

function mermaidToImages(md) {
  let idx = 0;
  return md.replace(/```mermaid\n[\s\S]*?```/g, () => {
    const name = DIAGRAM_NAMES[idx];
    idx += 1;
    if (!name) return "";
    const title = name.replace(/^m3-\d+-/, "").replace(/-/g, " ");
    return `\n![${title}](diagrams/${name}.png)\n`;
  });
}

function mdToBodyHtml(md) {
  let body = md.replace(/^[\s\S]*?(?=## Índice)/, "");
  body = body.replace(/## Índice[\s\S]*?(?=---\s*\n\s*\n\s*## 1\.)/, "");
  body = body.replace(/^---\s*\n+/m, "");
  body = mermaidToImages(body);

  let html = marked.parse(body, { gfm: true, breaks: false });

  html = html.replace(/<h2>([2-9]|10)\./g, '<h2 class="section-break">$1.');
  html = html.replace(/<blockquote>/g, '<blockquote class="note">');
  html = html.replace(
    /<img src="diagrams\//g,
    '<img class="diagram-img" src="diagrams/'
  );

  return html;
}

function buildToc() {
  const items = [
    ["1", "Resumen ejecutivo"],
    ["2", "Diagrama sistema on/off-chain"],
    ["3", "Modelo de autorización de fondos"],
    ["4", "Flujo WhatsApp → Blink y fallbacks"],
    ["5", "Componentes y responsabilidades"],
    ["6", "Datos: source of truth"],
    ["7", "Despliegue actual devnet"],
    ["8", "Principales riesgos técnicos"],
    ["9", "Evolución post–Demo Day"],
    ["10", "Evidencias M3"],
  ];
  return `<div class="toc"><h2>Índice</h2><ol>${items
    .map(([n, t]) => `<li><span class="num">${n}</span><span>${t}</span></li>`)
    .join("")}</ol></div>`;
}

function stripMd(s) {
  return s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/`/g, "");
}

function buildCover(meta) {
  const rows = [
    ["Proyecto", meta.Proyecto || "RemesaBlink"],
    ["Documento", meta.Documento || "Arquitectura M3"],
    ["Founder", meta.Founder || "Edgadafi"],
    ["Contacto", meta.Contacto || "remesatia@gmail.com"],
    ["Fecha entrega M3", meta["Fecha entrega M3"] || "10 de julio de 2026"],
    ["Program ID", meta["Program ID (devnet)"] || "B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2"],
    ["Mentor WayLearn", meta["Mentor WayLearn"] || "—"],
    ["Repositorio", meta.Repositorio || "github.com/Edgadafi/remesa-blink"],
    ["Clasificación", meta.Clasificación || "Confidencial"],
  ];

  return `<section class="cover-page">
    <div class="cover-bar">
      <p class="program">Solana Latam Labs · WayLearn</p>
      <h1>RemesaBlink</h1>
      <p class="doc-type">Arquitectura On/Off-Chain · Milestone 3</p>
    </div>
    <div class="cover-body">
      <div class="cover-escudo">${ESCUDO_SVG}</div>
      <p class="cover-tagline">${TAGLINE}</p>
      <table class="cover-meta">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${stripMd(v)}</td></tr>`).join("")}</table>
    </div>
    <div class="cover-footer">BRINGING - IT - CLOSER<div class="cover-confidential">Confidencial · Julio 2026</div></div>
  </section>`;
}

function buildHtml(md, css) {
  const extra = `
.diagram-img { display: block; max-width: 100%; height: auto; margin: 4mm auto 6mm; border: 1px solid rgba(201,162,39,0.45); border-radius: 4px; background: #fff; page-break-inside: avoid; }
`;
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><title>RemesaBlink Architecture M3</title><style>${css}${extra}</style></head><body>
  ${buildCover(parseCoverMeta(md))}
  <div class="content-wrap">
    <div class="page-header"><span class="brand">RemesaBlink</span><span class="meta">Arquitectura M3 · ${TAGLINE}</span></div>
    ${buildToc()}${mdToBodyHtml(md)}
    <div class="doc-footer">WayLearn · RemesaBlink · Arquitectura M3 · Julio 2026</div>
  </div></body></html>`;
}

function copyDirFlat(srcDir, destDir) {
  mkdirSync(destDir, { recursive: true });
  for (const f of readdirSync(srcDir)) {
    if (f.endsWith(".png")) {
      copyFileSync(join(srcDir, f), join(destDir, f));
    }
  }
}

function pdfViaEdge(htmlPath, pdfPath) {
  const edge = EDGE_PATHS.find((p) => existsSync(p));
  if (!edge) return false;
  try {
    mkdirSync(WIN_TEMP, { recursive: true });
    mkdirSync(join(WIN_TEMP, "diagrams"), { recursive: true });
    copyFileSync(htmlPath, WIN_TEMP_HTML);
    copyDirFlat(DIAGRAMS_DIR, join(WIN_TEMP, "diagrams"));
    execFileSync(
      edge,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        `--print-to-pdf=${WIN_TEMP_PDF_ARG}`,
        WIN_TEMP_HTML_URL,
      ],
      { stdio: "pipe", timeout: 180000 }
    );
    const winPdf = join(WIN_TEMP, "RemesaBlink-Architecture-M3.pdf");
    if (!existsSync(winPdf)) return false;
    copyFileSync(winPdf, pdfPath);
    return existsSync(pdfPath);
  } catch (err) {
    console.warn("Edge/Chrome:", err.message || err);
    return false;
  }
}

function ensureDiagrams() {
  const missing = DIAGRAM_NAMES.filter((n) => !existsSync(join(DIAGRAMS_DIR, `${n}.png`)));
  if (missing.length === 0) return;
  console.log("Generando diagramas PNG...");
  execFileSync("node", [join(root, "scripts/render-mermaid-diagrams.mjs")], {
    stdio: "inherit",
    cwd: root,
  });
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  ensureDiagrams();
  const md = readFileSync(MD_PATH, "utf8");
  const css = readFileSync(CSS_PATH, "utf8");
  const html = buildHtml(md, css);
  writeFileSync(OUT_HTML, html, "utf8");
  console.log("HTML:", OUT_HTML);
  if (pdfViaEdge(OUT_HTML, OUT_PDF)) {
    console.log("PDF:", OUT_PDF);
    copyFileSync(OUT_PDF, "/mnt/c/Users/edgar/Downloads/RemesaBlink-Architecture-M3.pdf");
    console.log("Copia:", "C:\\Users\\edgar\\Downloads\\RemesaBlink-Architecture-M3.pdf");
  } else {
    console.warn("Abre el HTML → Imprimir → PDF");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
