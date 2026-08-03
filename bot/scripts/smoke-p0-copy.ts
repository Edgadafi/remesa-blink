import {
  maskAddr,
  formatDestinatarioLabel,
  buildSuscripcionConfirmada,
  buildEnviarAskWallet,
  buildEnviarAskNombre,
  buildMontoNoCambiable,
  buildWalletProgramaRechazada,
} from "../src/copy.ts";
import {
  parseNombreContacto,
  looksLikeSolanaAddress,
  isBlockedSolanaAddress,
} from "../src/nlu.ts";

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
ok(buildEnviarAskNombre().includes("mi amor"), "ask nombre");

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
ok(reuse.includes("No pude cambiar el monto"), "reuse monto honest upfront");
ok(reuse.includes("$10"), "shows on-chain monto");
ok(reuse.includes("$1000"), "shows requested monto");
ok(!reuse.includes("Orden registrada"), "no false orden registrada");

const upfront = buildMontoNoCambiable({
  montoActivo: 10,
  montoPedido: 1000,
  tipo_activo: "USDC",
  frecuencia: "semanal",
  destinatario_wa: "5215559607277",
  nombre_contacto: "mi amor",
});
ok(upfront.includes("otra"), "suggests other wallet");

const pid = "B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2";
ok(isBlockedSolanaAddress(pid), "blocks program id");
ok(!looksLikeSolanaAddress(pid), "program id not a wallet");
ok(buildWalletProgramaRechazada().includes("sistema"), "program copy");

console.log("ALL PASSED");
