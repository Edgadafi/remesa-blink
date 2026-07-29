import {
  maskAddr,
  formatDestinatarioLabel,
  buildSuscripcionConfirmada,
  buildEnviarAskWallet,
  buildEnviarAskNombre,
} from "../src/copy.ts";
import { parseNombreContacto } from "../src/nlu.ts";

function ok(cond: boolean, msg: string) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("ok:", msg);
}

const sample = "5HopP9YXo3aK5tQ5xABCDEFGHtQ5x";
ok(maskAddr(sample) === "5Hop…tQ5x", "maskAddr 4+4");
ok(
  formatDestinatarioLabel("Mamá", "5215559607277") === "*Mamá* (+5215559607277)",
  "dest label"
);
ok(parseNombreContacto("Mamá") === "Mamá", "parse nombre");
ok(parseNombreContacto("5215559607277") === null, "reject WA as nombre");
ok(!buildEnviarAskWallet("Mamá").includes("dirección"), "wallet ask no direccion");
ok(buildEnviarAskNombre().includes("familiar"), "ask nombre");

const nueva = buildSuscripcionConfirmada({
  monto: 300,
  tipo_activo: "USDC",
  frecuencia: "mensual",
  destinatario_wa: "5215559607277",
  nombre_contacto: "Mamá",
  reused: false,
});
ok(nueva.includes("*Mamá* (+5215559607277)"), "confirm has nombre");
ok(!nueva.includes("esa cuenta"), "confirm no esa cuenta");

const reuse = buildSuscripcionConfirmada({
  monto: 10,
  tipo_activo: "USDC",
  frecuencia: "mensual",
  destinatario_wa: "5215559607277",
  nombre_contacto: "Mamá",
  montoPedido: 1000,
  reused: true,
});
ok(reuse.includes("no se actualizó"), "reuse monto honest");
ok(reuse.includes("$10"), "shows on-chain monto");
ok(reuse.includes("$1000"), "shows requested monto");
console.log("ALL PASSED");
