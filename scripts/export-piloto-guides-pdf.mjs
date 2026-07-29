#!/usr/bin/env node
/**
 * Exporta docs/GUIA-ABORDAJE-PILOTOS.md + VIDEO-GUIA → PDF pack
 * Uso: npm run docs:pdf:piloto
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { execFileSync } from "child_process";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const CSS_PATH = join(root, "docs/brand/pdf-base.css");
const OUT_DIR = join(root, "docs/M4-evidencias");

const EDGE_PATHS = [
  "/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/mnt/c/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
];
const WIN_TEMP = "/mnt/c/Users/edgar/AppData/Local/Temp/remesa-pdf";

async function pdfViaEdge(htmlPath, pdfPath, stem) {
  const edge = EDGE_PATHS.find((p) => existsSync(p));
  if (!edge) return false;
  try {
    mkdirSync(WIN_TEMP, { recursive: true });
    const winHtml = join(WIN_TEMP, `${stem}.html`);
    const winPdf = join(WIN_TEMP, `${stem}.pdf`);
    copyFileSync(htmlPath, winHtml);
    execFileSync(
      edge,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        `--print-to-pdf=C:\\Users\\edgar\\AppData\\Local\\Temp\\remesa-pdf\\${stem}.pdf`,
        `file:///C:/Users/edgar/AppData/Local/Temp/remesa-pdf/${stem}.html`,
      ],
      { stdio: "pipe", timeout: 120000 }
    );
    if (!existsSync(winPdf)) return false;
    copyFileSync(winPdf, pdfPath);
    return true;
  } catch (e) {
    console.warn(e.message || e);
    return false;
  }
}

function buildHtml(title, md, css) {
  const body = marked.parse(md, { gfm: true }).replace(/<blockquote>/g, '<blockquote class="note">');
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><title>${title}</title>
  <style>${css}
  .doc-header{padding:22mm 14mm 10mm;border-bottom:2px solid #2d5016;margin-bottom:6mm}
  .doc-header h1{margin:6px 0;font-size:20pt;color:#2c2416}
  .brand{color:#2d5016;letter-spacing:.04em;font-size:11pt}
  .content{padding:0 4mm 14mm}
  table{width:100%;border-collapse:collapse;font-size:9.5pt}
  th,td{border:1px solid #2d5016;padding:5px 7px;vertical-align:top}
  th{background:#2d5016;color:#f5f0e8}
  </style></head><body>
  <header class="doc-header"><div class="brand">REMESA BLINK + TIA</div>
  <h1>${title}</h1></header><main class="content">${body}</main></body></html>`;
}

async function exportOne(mdRel, stem, title) {
  mkdirSync(OUT_DIR, { recursive: true });
  const md = readFileSync(join(root, mdRel), "utf8");
  const css = readFileSync(CSS_PATH, "utf8");
  const htmlPath = join(OUT_DIR, `${stem}.html`);
  const pdfPath = join(OUT_DIR, `${stem}.pdf`);
  writeFileSync(htmlPath, buildHtml(title, md, css), "utf8");
  const ok = await pdfViaEdge(htmlPath, pdfPath, stem);
  console.log(ok ? `PDF ${pdfPath}` : `HTML only ${htmlPath}`);
}

await exportOne("docs/GUIA-ABORDAJE-PILOTOS.md", "RemesaBlink-Guia-Abordaje-Pilotos", "Guía de abordaje — Familias piloto");
await exportOne("docs/VIDEO-GUIA-USUARIO-PILOTO.md", "RemesaBlink-Video-Guia-Usuario-Piloto", "Video Guía de Usuario — Familia piloto");
