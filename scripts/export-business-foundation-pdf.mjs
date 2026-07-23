#!/usr/bin/env node
/**
 * Exporta docs/BUSINESS-FOUNDATION-M2.md → PDF con brand kit RemesaBlink v1.1
 * Uso: npm run docs:pdf:m2
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import { pathToFileURL } from "url";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const MD_PATH = join(root, "docs/BUSINESS-FOUNDATION-M2.md");
const CSS_PATH = join(root, "docs/brand/pdf-base.css");
const OUT_DIR = join(root, "docs/M2-evidencias");
const OUT_PDF = join(OUT_DIR, "RemesaBlink-Business-Foundation-M2.pdf");
const OUT_HTML = join(OUT_DIR, "RemesaBlink-Business-Foundation-M2.html");

const ESCUDO_SVG = `<svg viewBox="0 0 120 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Escudo RemesaBlink">
  <path d="M60 6c-8 4-14 12-14 20 0 2 1 4 2 5l12-8 12 8c1-1 2-3 2-5 0-8-6-16-14-20z" fill="#C9A227" opacity="0.9"/>
  <path d="M48 28c4 6 8 10 12 12 4-2 8-6 12-12-3 2-6 3-12 3s-9-1-12-3z" fill="#2D5016"/>
  <ellipse cx="52" cy="34" rx="2.5" ry="3" fill="#C45C3E"/>
  <ellipse cx="60" cy="36" rx="2.5" ry="3" fill="#C45C3E"/>
  <ellipse cx="68" cy="34" rx="2.5" ry="3" fill="#C45C3E"/>
  <path d="M38 24h44M32 24h2M86 24h2" stroke="#C9A227" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

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

function mdToBodyHtml(md) {
  let body = md.replace(/^[\s\S]*?(?=## Índice)/, "");
  body = body.replace(/## Índice[\s\S]*?(?=---\s*\n\s*\n\s*## 2\.1)/, "");
  body = body.replace(/^---\s*\n+/m, "");

  let html = marked.parse(body, { gfm: true, breaks: false });

  html = html.replace(/<h2>2\.(\d+)/g, (_, n) => {
    const br = n === "1" ? "" : ' class="section-break"';
    return `<h2${br}>2.${n}`;
  });
  html = html.replace(/<blockquote>/g, '<blockquote class="note">');
  return html;
}

function buildToc() {
  const items = [
    ["2.1", "Propuesta de Valor"],
    ["2.2", "Modelo de Negocio Inicial / Ruta de Sostenibilidad"],
    ["2.3", "Competidores o Alternativas Existentes"],
    ["2.4", "Primeras Hipótesis de Mercado y Adopción"],
    ["2.5", "Señal de Validación Inicial"],
    ["2.6", "Evidencia Adjunta"],
    ["—", "Resumen ejecutivo"],
  ];
  return `<div class="toc">
    <h2>Índice</h2>
    <ol>${items.map(([n, t]) => `<li><span class="num">${n}</span><span>${t}</span></li>`).join("")}</ol>
  </div>`;
}

function stripMd(s) {
  return s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/`/g, "");
}

function buildCover(meta) {
  const rows = [
    ["Proyecto", meta.Proyecto || "RemesaBlink"],
    ["Documento", meta.Documento || "Business Foundation — M2"],
    ["Founder", meta.Founder || "—"],
    ["Contacto", meta.Contacto || "remesatia@gmail.com"],
    ["Fecha entrega M2", meta["Fecha entrega M2"] || "3 de julio de 2026"],
    ["Demo Day", meta["Demo Day"] || "31 de agosto de 2026"],
    ["Programa", "Solana Latam Labs — WayLearn"],
    ["Mentor WayLearn", meta["Mentor WayLearn"] || "—"],
    ["Repositorio", meta.Repositorio || "github.com/Edgadafi/remesa-blink"],
    ["Clasificación", meta.Clasificación || "Confidencial"],
  ];

  return `<section class="cover-page">
    <div class="cover-bar">
      <p class="program">Solana Latam Labs · WayLearn</p>
      <h1>RemesaBlink</h1>
      <p class="doc-type">Business Foundation · Milestone 2</p>
    </div>
    <div class="cover-body">
      <div class="cover-escudo">${ESCUDO_SVG}</div>
      <p class="cover-tagline">Send dollars, recibe pesos más cerca de tu familia.</p>
      <table class="cover-meta">
        ${rows.map(([k, v]) => `<tr><th>${k}</th><td>${stripMd(v)}</td></tr>`).join("")}
      </table>
    </div>
    <div class="cover-footer">
      BRINGING - IT - CLOSER
      <div class="cover-confidential">Confidencial · Julio 2026</div>
    </div>
  </section>`;
}

function buildHtml(md, css) {
  const meta = parseCoverMeta(md);
  const body = mdToBodyHtml(md);
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>RemesaBlink — Business Foundation M2</title>
  <style>${css}</style>
</head>
<body>
  ${buildCover(meta)}
  <div class="content-wrap">
    <div class="page-header">
      <span class="brand">RemesaBlink</span>
      <span class="meta">Business Foundation M2 · WayLearn · Confidencial</span>
    </div>
    ${buildToc()}
    ${body}
    <div class="doc-footer">WayLearn Solana Latam Labs · RemesaBlink · Business Foundation M2 · Julio 2026</div>
  </div>
</body>
</html>`;
}

const EDGE_PATHS = [
  "/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/mnt/c/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
];

const WIN_TEMP = "/mnt/c/Users/edgar/AppData/Local/Temp";
const WIN_TEMP_HTML = join(WIN_TEMP, "remesablink-business-foundation-m2.html");
const WIN_TEMP_PDF = join(WIN_TEMP, "remesablink-business-foundation-m2.pdf");
const WIN_TEMP_PDF_ARG = "C:\\Users\\edgar\\AppData\\Local\\Temp\\remesablink-business-foundation-m2.pdf";
const WIN_TEMP_HTML_URL =
  "file:///C:/Users/edgar/AppData/Local/Temp/remesablink-business-foundation-m2.html";

function pdfViaEdge(htmlPath, pdfPath) {
  const edge = EDGE_PATHS.find((p) => existsSync(p));
  if (!edge) return false;
  try {
    mkdirSync(WIN_TEMP, { recursive: true });
    copyFileSync(htmlPath, WIN_TEMP_HTML);
    execFileSync(
      edge,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        `--print-to-pdf=${WIN_TEMP_PDF_ARG}`,
        WIN_TEMP_HTML_URL,
      ],
      { stdio: "pipe", timeout: 120000 }
    );
    if (!existsSync(WIN_TEMP_PDF)) return false;
    copyFileSync(WIN_TEMP_PDF, pdfPath);
    return existsSync(pdfPath);
  } catch (err) {
    console.warn("Edge/Chrome headless:", err.message || err);
    return false;
  }
}

async function pdfViaPuppeteer(htmlPath, pdfPath) {
  const puppeteer = await import("puppeteer").then((m) => m.default).catch(() => null);
  if (!puppeteer) return false;
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return existsSync(pdfPath);
  } finally {
    await browser.close();
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const md = readFileSync(MD_PATH, "utf8");
  const css = readFileSync(CSS_PATH, "utf8");
  const html = buildHtml(md, css);
  writeFileSync(OUT_HTML, html, "utf8");
  console.log("HTML generado:", OUT_HTML);

  if (pdfViaEdge(OUT_HTML, OUT_PDF)) {
    console.log("PDF generado (Edge/Chrome):", OUT_PDF);
    return;
  }

  if (await pdfViaPuppeteer(OUT_HTML, OUT_PDF)) {
    console.log("PDF generado (Puppeteer):", OUT_PDF);
    return;
  }

  console.warn(
    "No se pudo generar PDF automáticamente. Abre el HTML en Edge/Chrome → Imprimir → Guardar como PDF."
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
