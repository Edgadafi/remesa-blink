/**
 * Smoke NLU / copy P0.5–P0.6 — one-shot enviar + fluidez coloquial.
 * Uso: npx tsx scripts/smoke-nlu.ts
 */
import assert from "node:assert/strict";
import {
  buildAyuda,
  buildFrecuenciaQuincena,
  buildRecurrentePending,
  buildSuscripcionConfirmada,
  buildMontoNoCambiable,
  buildWalletProgramaRechazada,
  formatMxnEstimateLine,
} from "../src/copy.js";
import {
  detectIntent,
  isBlockedSolanaAddress,
  isMainMenuDigit,
  looksLikeMontoOnly,
  looksLikeSolanaAddress,
  mentionsQuincena,
  parseEnviarOneshoot,
  parseModoEnvio,
} from "../src/nlu.js";
import { nextEnviarStep } from "../src/session.js";

function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ok  ${name}`);
  } catch (e) {
    console.error(`  FAIL ${name}`);
    throw e;
  }
}

console.log("=== bot smoke: one-shot NLU + confirmación ===");

check("enviar 2000 a mi mujer → monto+nombre", () => {
  const p = parseEnviarOneshoot("Enviar 2000 dólares en pesos a mi mujer");
  assert.equal(p.monto, 2000);
  assert.equal(p.tipo_activo, "USDC");
  assert.match(p.nombre_contacto ?? "", /mi mujer/i);
  assert.equal(p.frecuencia, undefined);
  assert.equal(
    nextEnviarStep({
      tipo_activo: p.tipo_activo,
      monto: p.monto,
      nombre_contacto: p.nombre_contacto,
    }),
    "enviar_frecuencia"
  );
});

check("enviar 2000 a mi reina", () => {
  const p = parseEnviarOneshoot("enviar 2000 dólares a mi reina");
  assert.equal(p.monto, 2000);
  assert.match(p.nombre_contacto ?? "", /mi reina/i);
});

check("manda 300 a mi amor cada mes", () => {
  const p = parseEnviarOneshoot("manda 300 a mi amor cada mes");
  assert.equal(p.monto, 300);
  assert.match(p.nombre_contacto ?? "", /mi amor/i);
  assert.equal(p.frecuencia, "mensual");
  assert.equal(
    nextEnviarStep({
      tipo_activo: "USDC",
      monto: 300,
      frecuencia: "mensual",
      nombre_contacto: "mi amor",
    }),
    "enviar_familia"
  );
});

check("solo enviar → sin prefill", () => {
  const p = parseEnviarOneshoot("enviar");
  assert.equal(p.monto, undefined);
  assert.equal(p.nombre_contacto, undefined);
  assert.equal(nextEnviarStep({ tipo_activo: "USDC" }), "enviar_monto");
});

check("pending usa nombre_contacto", () => {
  const t = buildRecurrentePending({
    monto: 2000,
    tipo_activo: "USDC",
    frecuencia: "semanal",
    nombre_contacto: "Mi reina",
  });
  assert.match(t, /Mi reina/);
  assert.doesNotMatch(t, /tu familia en México/);
});

check("orden confirmada (nueva)", () => {
  const t = buildSuscripcionConfirmada({
    monto: 2000,
    tipo_activo: "USDC",
    frecuencia: "semanal",
    destinatario_wa: "5215559607277",
    nombre_contacto: "Mi reina",
  });
  assert.match(t, /Orden confirmada/);
  assert.match(t, /Mi reina/);
  assert.match(t, /\$2000/);
  assert.match(t, /cada semana/);
  assert.match(t, /mis envíos/);
});

check("monto no cambiable (reuse monto distinto)", () => {
  const t = buildSuscripcionConfirmada({
    monto: 10,
    tipo_activo: "USDC",
    frecuencia: "semanal",
    destinatario_wa: "5215559607277",
    nombre_contacto: "Mi reina",
    montoPedido: 2000,
    reused: true,
  });
  assert.match(t, /No pude cambiar el monto/i);
  assert.match(t, /\$10/);
  assert.match(t, /\$2000/);
  assert.match(t, /no se cambia/i);
  assert.doesNotMatch(t, /Programando/);
  assert.doesNotMatch(t, /Orden registrada/);
});

check("buildMontoNoCambiable upfront", () => {
  const t = buildMontoNoCambiable({
    montoActivo: 10,
    montoPedido: 1000,
    tipo_activo: "USDC",
    frecuencia: "semanal",
    destinatario_wa: "5215559607277",
    nombre_contacto: "mi amor",
  });
  assert.match(t, /\$10/);
  assert.match(t, /\$1000/);
  assert.match(t, /otra.*cuenta/i);
});

check("rechaza program id como wallet", () => {
  const pid = "B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2";
  assert.equal(isBlockedSolanaAddress(pid), true);
  assert.equal(looksLikeSolanaAddress(pid), false);
  assert.match(buildWalletProgramaRechazada(), /sistema/i);
});

console.log("\n=== P0.6 fluidez NLU ===");

check("detectIntent: mandarle / giro / que onda", () => {
  assert.equal(detectIntent("mandarle 300"), "enviar");
  assert.equal(detectIntent("quiero hacer un giro"), "enviar");
  assert.equal(detectIntent("que onda"), "ayuda");
  assert.equal(detectIntent("envair 200"), "enviar");
});

check("detectIntent: mis mandados / ya salio", () => {
  assert.equal(detectIntent("mis mandados"), "mis_envios");
  assert.equal(detectIntent("ya salio mi remesa?"), "mis_envios");
});

check("detectIntent: soporte sin falso positivo problema", () => {
  assert.equal(detectIntent("tengo un problema con mi banco"), "unknown");
  assert.equal(detectIntent("soporte"), "soporte");
  assert.equal(detectIntent("no me llego el aviso"), "soporte");
});

check("looksLikeMontoOnly: 300 y $200", () => {
  assert.equal(looksLikeMontoOnly("300"), true);
  assert.equal(looksLikeMontoOnly("$200"), true);
  assert.equal(looksLikeMontoOnly("hola 300"), false);
});

check("mentionsQuincena", () => {
  assert.equal(mentionsQuincena("cada quincena"), true);
  assert.equal(mentionsQuincena("cada mes"), false);
  assert.match(buildFrecuenciaQuincena(), /piloto/i);
});

check("parse: pa mi vieja / para la jefa", () => {
  const p1 = parseEnviarOneshoot("manda 500 pa mi vieja");
  assert.equal(p1.monto, 500);
  assert.match(p1.nombre_contacto ?? "", /mi vieja/i);
  const p2 = parseEnviarOneshoot("enviar 100 para la jefa cada mes");
  assert.equal(p2.monto, 100);
  assert.match(p2.nombre_contacto ?? "", /la jefa/i);
  assert.equal(p2.frecuencia, "mensual");
});

check("buildAyuda menciona TIA y enviar ahora", () => {
  assert.match(buildAyuda(), /TIA/);
  assert.match(buildAyuda(), /enviar ahora/i);
  assert.match(buildAyuda(), /programar/i);
  assert.doesNotMatch(buildAyuda(), /Remesa Blink/);
});

console.log("\n=== P0.7 enviar ahora vs programar ===");

check("detectIntent: enviar ahora / programar / menu numeros", () => {
  assert.equal(detectIntent("enviar ahora"), "enviar_inmediato");
  assert.equal(detectIntent("programar"), "programar");
  assert.equal(detectIntent("1"), "enviar_inmediato");
  assert.equal(detectIntent("2"), "programar");
  assert.equal(detectIntent("3"), "mis_envios");
  assert.equal(detectIntent("mandarle 300"), "enviar");
});

check("menu digit 1 no es monto $1", () => {
  assert.equal(isMainMenuDigit("1"), true);
  assert.equal(isMainMenuDigit("50"), false);
  assert.equal(looksLikeMontoOnly("1"), false);
  assert.equal(parseEnviarOneshoot("1").monto, undefined);
  assert.equal(
    nextEnviarStep({
      tipo_activo: "USDC",
      modo_envio: "inmediato",
    }),
    "enviar_monto"
  );
});

check("parseModoEnvio", () => {
  assert.equal(parseModoEnvio("1"), "inmediato");
  assert.equal(parseModoEnvio("programar"), "programar");
  assert.equal(parseModoEnvio("inmediato"), "inmediato");
});

check("nextEnviarStep salta frecuencia en inmediato", () => {
  assert.equal(
    nextEnviarStep({
      tipo_activo: "USDC",
      modo_envio: "inmediato",
      monto: 300,
    }),
    "enviar_nombre"
  );
});

console.log("\n=== P0.8 FX estimado MXN ===");

check("formatMxnEstimateLine + confirmación USDC", () => {
  const line = formatMxnEstimateLine(850);
  assert.match(line ?? "", /MXN estimados/i);
  assert.match(line ?? "", /puede variar/i);
  const pending = buildRecurrentePending({
    monto: 50,
    tipo_activo: "USDC",
    frecuencia: "mensual",
    mxn_estimated: 900,
    envio_inmediato: true,
  });
  assert.match(pending, /900/);
  const ok = buildSuscripcionConfirmada({
    monto: 50,
    tipo_activo: "USDC",
    frecuencia: "mensual",
    destinatario_wa: "5215559607277",
    mxn_estimated: 900,
  });
  assert.match(ok, /estimados al retirar/i);
});

console.log("=== all smoke passed ===");
