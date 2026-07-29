#!/usr/bin/env node
/**
 * Exporta docs/TRUST-MODEL.md → PDF (brand kit RemesaBlink)
 * Uso: npm run docs:pdf:trust
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { execFileSync } from "child_process";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const MD_PATH = join(root, "docs/TRUST-MODEL.md");
const CSS_PATH = join(root, "docs/brand/pdf-base.css");
const OUT_DIR = join(root, "docs/M4-evidencias");
const OUT_PDF = join(OUT_DIR, "RemesaBlink-Trust-Model.pdf");
const OUT_HTML = join(OUT_DIR, "RemesaBlink-Trust-Model.html");

const EDGE_PATHS = [
  "/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/mnt/c/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];

const WIN_TEMP = "/mnt/c/Users/edgar/AppData/Local/Temp/remesa-pdf";
const WIN_TEMP_HTML = join(WIN_TEMP, "trust-model.html");
const WIN_TEMP_PDF = join(WIN_TEMP, "trust-model.pdf");
const WIN_TEMP_HTML_URL = "file:///C:/Users/edgar/AppData/Local/Temp/remesa-pdf/trust-model.html";
const WIN_TEMP_PDF_ARG = "C:\\Users\\edgar\\AppData\\Local\\Temp\\remesa-pdf\\trust-model.pdf";

const ESCUDO_SVG = `<svg viewBox="0 0 120 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Escudo RemesaBlink">
  <path d="M60 6c-8 4-14 12-14 20 0 2 1 4 2 5l12-8 12 8c1-1 2-3 2-5 0-8-6-16-14-20z" fill="#C9A227" opacity="0.9"/>
  <path d="M48 28c4 6 8 10 12 12 4-2 8-6 12-12-3 2-6 3-12 3s-9-1-12-3z" fill="#2D5016"/>
  <ellipse cx="52" cy="34" rx="2.5" ry="3" fill="#C45C3E"/>
  <ellipse cx="60" cy="36" rx="2.5" ry="3" fill="#C45C3E"/>
  <ellipse cx="68" cy="34" rx="2.5" ry="3" fill="#C45C3E"/>
  <path d="M38 24h44M32 24h2M86 24h2" stroke="#C9A227" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

function mdToBodyHtml(md) {
  // Keep full doc; mermaid stays as fenced code (readable in PDF)
  let html = marked.parse(md, { gfm: true, breaks: false });
  html = html.replace(/<blockquote>/g, '<blockquote class="note">');
  html = html.replace(/<h2>/g, '<h2 class="section-break">');
  // first h2 should not force page break after cover
  html = html.replace('<h2 class="section-break">', "<h2>", 1);
  return html;
}

function buildHtml(md, css) {
  const body = mdToBodyHtml(md);
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Modelo de confianza — RemesaBlink</title>
  <style>${css}
  .doc-header { padding: 28mm 16mm 12mm; border-bottom: 2px solid #2d5016; margin-bottom: 8mm; }
  .doc-header .brand { color: #2d5016; font-family: Palatino, Georgia, serif; font-size: 14pt; letter-spacing: 0.04em; }
  .doc-header h1 { margin: 8px 0 4px; color: #2c2416; font-size: 22pt; }
  .doc-header .sub { color: #4a7c59; font-size: 11pt; }
  .doc-header .escudo { width: 90px; margin-bottom: 8px; }
  .content { padding: 0 4mm 16mm; }
  pre { font-size: 8pt; background: #efe8dc; padding: 8px; overflow-wrap: anywhere; white-space: pre-wrap; }
  code { font-family: "IBM Plex Mono", monospace; font-size: 0.9em; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin: 10px 0; }
  th, td { border: 1px solid #2d5016; padding: 6px 8px; vertical-align: top; }
  th { background: #2d5016; color: #f5f0e8; }
  </style>
</head>
<body>
  <header class="doc-header">
    <div class="escudo">${ESCUDO_SVG}</div>
    <div class="brand">REMESA BLINK · WAYLEARN</div>
    <h1>Modelo de confianza</h1>
    <p class="sub">TRUST-MODEL · Jul 2026 · Demo Day 31 ago 2026</p>
    <p class="sub"><em>El agente en WhatsApp programa; Solana audita; tu familia vigila.</em></p>
  </header>
  <main class="content">${body}</main>
</body>
</html>`;
}

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
      margin: { top: "12mm", right: "12mm", bottom: "14mm", left: "12mm" },
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
  console.log("HTML:", OUT_HTML);

  if (pdfViaEdge(OUT_HTML, OUT_PDF)) {
    console.log("PDF:", OUT_PDF);
    return;
  }
  if (await pdfViaPuppeteer(OUT_HTML, OUT_PDF)) {
    console.log("PDF:", OUT_PDF);
    return;
  }
  console.warn("PDF auto-fail. Abre el HTML e Imprimir → Guardar como PDF:", OUT_HTML);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
