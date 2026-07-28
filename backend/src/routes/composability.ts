/**
 * Rutas de composabilidad on-chain (lectura de perfiles PDAs)
 */
import { Router } from "express";
import { PublicKey } from "@solana/web3.js";
import {
  fetchPerfilRemitente,
  fetchPerfilDestinatario,
  getPerfilRemitentePda,
  getPerfilDestinatarioPda,
  MINT_SOL_SENTINEL,
} from "../services/solana.js";
import { listarPagosPorWallet } from "../services/pagos.js";

const router = Router();

function parseWallet(param: string): PublicKey | null {
  try {
    return new PublicKey(param);
  } catch {
    return null;
  }
}

router.get("/perfil/:wallet", async (req, res) => {
  try {
    const wallet = parseWallet(req.params.wallet);
    if (!wallet) {
      return res.status(400).json({ error: "Wallet inválida" });
    }

    const [perfilRemitentePda] = getPerfilRemitentePda(wallet);
    const [perfilDestinatarioPda] = getPerfilDestinatarioPda(wallet);

    const [remitente, destinatario, pagosOffChain] = await Promise.all([
      fetchPerfilRemitente(wallet),
      fetchPerfilDestinatario(wallet),
      listarPagosPorWallet(wallet.toBase58()),
    ]);

    res.json({
      wallet: wallet.toBase58(),
      perfilRemitentePda: perfilRemitentePda.toBase58(),
      perfilDestinatarioPda: perfilDestinatarioPda.toBase58(),
      remitente: remitente
        ? {
            totalEnviado: remitente.totalEnviado.toString(),
            pagosCompletados: remitente.pagosCompletados.toNumber(),
            primeraActividad: remitente.primeraActividad.toNumber(),
            ultimaActividad: remitente.ultimaActividad.toNumber(),
          }
        : null,
      destinatario: destinatario
        ? {
            totalRecibido: destinatario.totalRecibido.toString(),
            pagosCompletados: destinatario.pagosCompletados.toNumber(),
            primeraActividad: destinatario.primeraActividad.toNumber(),
            ultimaActividad: destinatario.ultimaActividad.toNumber(),
          }
        : null,
      pagosOffChain,
      mintSolSentinel: MINT_SOL_SENTINEL.toBase58(),
    });
  } catch (err) {
    console.error("Error composability perfil:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Error al leer perfil on-chain",
    });
  }
});

export default router;
