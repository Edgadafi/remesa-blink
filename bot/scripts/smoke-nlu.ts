/**
 * Smoke NLU / copy P0.5 — one-shot enviar + orden confirmada.
 * Uso: npx tsx scripts/smoke-nlu.ts
 */
import assert from "node:assert/strict";
import {
  buildRecurrentePending,
  buildSuscripcionConfirmada,
} from "../src/copy.js";
import { parseEnviarOneshoot } from "../src/nlu.js";
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

check("orden registrada (reuse monto distinto)", () => {
  const t = buildSuscripcionConfirmada({
    monto: 10,
    tipo_activo: "USDC",
    frecuencia: "semanal",
    destinatario_wa: "5215559607277",
    nombre_contacto: "Mi reina",
    montoPedido: 2000,
    reused: true,
  });
  assert.match(t, /Orden registrada/);
  assert.match(t, /\$10/);
  assert.match(t, /\$2000/);
  assert.match(t, /no se cambió/i);
});

console.log("=== all smoke passed ===");
