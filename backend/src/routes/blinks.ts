/**
 * Rutas Blinks - montadas en el mismo servidor que el backend
 * Usa @solana/actions SDK para conformidad con la spec
 */
import express, { Router } from "express";
import {
  createPostResponse,
  type ActionGetResponse,
} from "@solana/actions";
import pool from "../db/pool.js";
import {
  createQuote,
  createOrder,
  resolveOfframpIds,
  mapEtherfuseError,
  EtherfuseUserError,
  ETHERFUSE_USDC_MINT,
} from "../services/etherfuse.js";
import { getOnboardingPresignedUrl, AlreadyOnboardedError } from "./etherfuse.js";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
} from "@solana/spl-token";
import { validateAmountSol, validateAmountUsdc } from "../constants.js";

const router = Router();
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const USDC_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const USDC_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDC_MINT = new PublicKey(
  process.env.USDC_MINT || (SOLANA_RPC.includes("devnet") ? USDC_DEVNET : USDC_MAINNET)
);

function getBaseUrl(): string {
  return process.env.BLINKS_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
}

/** Icon absoluto estable (el favicon de solana.com a menudo falla en móvil). */
function blinkIconUrl(): string {
  const front =
    process.env.FRONTEND_PUBLIC_URL?.replace(/\/$/, "") ||
    "https://frontend-bay-phi-92.vercel.app";
  return `${front}/piloto/hero-banner.png`;
}


router.get("/actions.json", (_req, res) => {
  const base = getBaseUrl();
  res.json({
    actions: [
      { url: `${base}/api/actions/remesa`, label: "Remesa", description: "Transferir SOL a una wallet de destino (alias de enviar-remesa)" },
      { url: `${base}/api/actions/enviar-remesa`, label: "Enviar Remesa SOL", description: "Transferir SOL a una wallet de destino" },
      { url: `${base}/api/actions/enviar-remesa-usdc`, label: "Enviar Remesa USDC", description: "Transferir USDC a una wallet de destino" },
      { url: `${base}/api/actions/convertir-mxn`, label: "Recibir pesos en tu cuenta", description: "Pasar remesa a pesos mexicanos (SPEI / Etherfuse sandbox)" },
      { url: `${base}/api/actions/onboarding-mxn`, label: "Registrar cuenta para pesos", description: "INE + CLABE una sola vez para recibir pesos en tu banco" },
    ],
  });
});

function remesaMetadata(hrefPath: string): ActionGetResponse {
  const base = getBaseUrl();
  return {
    type: "action",
    title: "Remesa Blink",
    icon: blinkIconUrl(),
    description: "Transferir SOL a una wallet de destino",
    label: "Enviar Remesa SOL",
    links: {
      actions: [{
        label: "Enviar",
        href: `${base}${hrefPath}`,
        parameters: [
          { name: "account", label: "Tu wallet", required: true, type: "text" },
          { name: "amount", label: "Monto (SOL)", required: true, type: "number" },
          { name: "destination", label: "Wallet destino", required: true, type: "text" },
        ],
      }],
    },
  };
}

router.get("/api/actions/enviar-remesa", (_req, res) =>
  res.json(remesaMetadata("/api/actions/enviar-remesa"))
);
router.get("/api/actions/remesa", (_req, res) =>
  res.json(remesaMetadata("/api/actions/remesa"))
);

router.get("/api/actions/enviar-remesa-usdc", (_req, res) => {
  const base = getBaseUrl();
  const payload: ActionGetResponse = {
    type: "action",
    title: "Remesa Blink USDC",
    icon: blinkIconUrl(),
    description: "Transferir USDC a una wallet de destino",
    label: "Enviar Remesa USDC",
    links: {
      actions: [{
        label: "Enviar",
        href: `${base}/api/actions/enviar-remesa-usdc`,
        parameters: [
          { name: "account", label: "Tu wallet", required: true, type: "text" },
          { name: "amount", label: "Monto (USDC)", required: true, type: "number" },
          { name: "destination", label: "Wallet destino", required: true, type: "text" },
        ],
      }],
    },
  };
  res.json(payload);
});

const enviarRemesaPost = async (req: express.Request, res: express.Response) => {
  try {
    const { account, amount, destination } = req.body;
    if (!account || !amount || !destination) {
      return res.status(400).json({ message: "account, amount y destination son requeridos" });
    }
    const fromPubkey = new PublicKey(account);
    const toPubkey = new PublicKey(destination);
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "Monto debe ser positivo" });
    }
    const validSol = validateAmountSol(amountNum);
    if (!validSol.ok) {
      return res.status(400).json({ message: validSol.message });
    }
    const lamports = Math.round(amountNum * LAMPORTS_PER_SOL);

    const connection = new Connection(RPC_URL);
    const tx = new Transaction().add(SystemProgram.transfer({ fromPubkey, toPubkey, lamports }));
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = fromPubkey;

    const payload = await createPostResponse({
      fields: {
        transaction: tx,
        message: `Transferir ${amount} SOL a ${destination}`,
      },
    });
    res.json(payload);
  } catch (err) {
    console.error("Error enviar-remesa:", err);
    res.status(500).json({ message: err instanceof Error ? err.message : "Error al crear transacción" });
  }
};

router.post("/api/actions/enviar-remesa", enviarRemesaPost);
router.post("/api/actions/remesa", enviarRemesaPost);

router.post("/api/actions/enviar-remesa-usdc", async (req, res) => {
  try {
    const { account, amount, destination } = req.body;
    if (!account || !amount || !destination) {
      return res.status(400).json({ message: "account, amount y destination son requeridos" });
    }
    const fromPubkey = new PublicKey(account);
    const toPubkey = new PublicKey(destination);
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "Monto debe ser positivo" });
    }
    const validUsdc = validateAmountUsdc(amountNum);
    if (!validUsdc.ok) {
      return res.status(400).json({ message: validUsdc.message });
    }
    const amountRaw = BigInt(Math.round(amountNum * 1e6));

    const connection = new Connection(RPC_URL);
    const fromAta = getAssociatedTokenAddressSync(USDC_MINT, fromPubkey);
    const toAta = getAssociatedTokenAddressSync(USDC_MINT, toPubkey);
    const createAtaIx = createAssociatedTokenAccountIdempotentInstruction(fromPubkey, toAta, toPubkey, USDC_MINT);
    const transferIx = createTransferInstruction(fromAta, toAta, fromPubkey, amountRaw, [], TOKEN_PROGRAM_ID);
    const tx = new Transaction().add(createAtaIx, transferIx);

    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = fromPubkey;

    const payload = await createPostResponse({
      fields: {
        transaction: tx,
        message: `Transferir ${amount} USDC a ${destination}`,
      },
    });
    res.json(payload);
  } catch (err) {
    console.error("Error enviar-remesa-usdc:", err);
    res.status(500).json({ message: err instanceof Error ? err.message : "Error al crear transacción" });
  }
});

// --- Onboarding MXN (KYC + CLABE para Etherfuse) ---

router.get("/api/actions/onboarding-mxn", (_req, res) => {
  const base = getBaseUrl();
  res.json({
    type: "action",
    title: "Registrar cuenta para pesos",
    icon: blinkIconUrl(),
    description: "Completa tu registro (INE + CLABE) una sola vez para recibir pesos en tu banco",
    label: "Obtener enlace de registro",
    links: {
      actions: [{
        label: "Obtener enlace",
        href: `${base}/api/actions/onboarding-mxn`,
        parameters: [
          { name: "account", label: "Tu cuenta (wallet)", required: true, type: "text" },
        ],
      }],
    },
  });
});

router.post("/api/actions/onboarding-mxn", async (req, res) => {
  try {
    const { account } = req.body;
    if (!account) {
      return res.status(400).json({ message: "account (wallet) requerido" });
    }
    const { presignedUrl } = await getOnboardingPresignedUrl(account, null, {
      email:
        process.env.ETHERFUSE_ONBOARDING_EMAIL ||
        process.env.ETHERFUSE_DEMO_EMAIL ||
        "remesatia@gmail.com",
      displayName:
        process.env.ETHERFUSE_DEMO_DISPLAY_NAME || "Remesa Blink",
    });
    res.json({
      link: presignedUrl,
      message: "Abre el enlace para registrar tu INE y CLABE. Válido 15 min. Después podrás recibir pesos en tu banco.",
    });
  } catch (err) {
    if (err instanceof AlreadyOnboardedError) {
      return res.status(409).json({
        message: "Ya estás registrada para recibir pesos. Usa el link de conversión.",
        code: "ALREADY_ONBOARDED",
      });
    }
    console.error("Error onboarding-mxn:", err);
    res.status(500).json({
      message: mapEtherfuseError(err),
    });
  }
});

// --- Convertir USDC a MXN (Etherfuse off-ramp) ---

router.get("/api/actions/convertir-mxn", (req, res) => {
  const base = getBaseUrl();
  const amountQ = typeof req.query.amount === "string" ? req.query.amount : "";
  const href = amountQ
    ? `${base}/api/actions/convertir-mxn?amount=${encodeURIComponent(amountQ)}`
    : `${base}/api/actions/convertir-mxn`;
  res.json({
    type: "action",
    title: "Recibir pesos en tu cuenta",
    icon: blinkIconUrl(),
    description: "Pasa tu remesa a pesos mexicanos. Llegan a tu banco en unos minutos.",
    label: "Recibir pesos",
    links: {
      actions: [{
        label: amountQ ? `Recibir pesos ($${amountQ})` : "Recibir pesos",
        href,
        parameters: [
          { name: "account", label: "Tu cuenta (con el dinero de la remesa)", required: true, type: "text" },
          ...(amountQ
            ? []
            : [{ name: "amount", label: "Monto", required: true, type: "number" as const }]),
        ],
      }],
    },
  });
});

router.post("/api/actions/convertir-mxn", async (req, res) => {
  try {
    const { account, amount } = req.body;
    const amountQuery = req.query.amount as string | undefined;
    const amt = amount ?? amountQuery;
    if (!account || !amt) {
      return res.status(400).json({ message: "account y amount son requeridos" });
    }
    const amountNum = parseFloat(amt);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "Monto debe ser positivo" });
    }
    const validUsdc = validateAmountUsdc(amountNum);
    if (!validUsdc.ok) {
      return res.status(400).json({ message: validUsdc.message });
    }
    const sourceAmount = String(Math.round(amountNum * 1e6) / 1e6);

    const row = await pool.query(
      `SELECT etherfuse_customer_id, etherfuse_bank_account_id, kyc_status, destinatario_wa
       FROM beneficiarios_etherfuse WHERE destinatario_solana = $1`,
      [account]
    );
    if (!row.rows[0]) {
      return res.status(400).json({
        message: "Primero registra tu cuenta para pesos (INE + CLABE). Usa el link de registro.",
      });
    }
    const { etherfuse_customer_id, etherfuse_bank_account_id, kyc_status, destinatario_wa } =
      row.rows[0];
    if (kyc_status !== "verified") {
      return res.status(400).json({
        message:
          kyc_status === "failed"
            ? "Tu registro no pudo verificarse. Responde AYUDA en WhatsApp."
            : "Tu registro aún está en revisión. En cuanto quede listo te avisamos por WhatsApp.",
      });
    }

    // Sandbox / ETHERFUSE_DEMO_USE_ORG_BANK: si personal bank vacío → partner org bank
    const resolved = await resolveOfframpIds(
      etherfuse_customer_id,
      etherfuse_bank_account_id
    );

    const quote = await createQuote(resolved.customerId, sourceAmount);
    const { orderId, burnTransaction, statusPage } = await createOrder(
      quote.quoteId,
      resolved.bankAccountId,
      account
    );

    await pool.query(
      `UPDATE beneficiarios_etherfuse
       SET last_order_id = $1::uuid, last_order_status = 'pending', updated_at = NOW()
       WHERE destinatario_solana = $2`,
      [orderId, account]
    );

    if (destinatario_wa) {
      await pool.query(
        `UPDATE blinks_pendientes
         SET estado = 'enviado'
         WHERE estado = 'pendiente'
           AND destinatario_wa = $1
           AND url_blink LIKE '%convertir-mxn%'`,
        [destinatario_wa]
      );
    }

    // Sin burn: sandbox a menudo omite tx hasta haber USDC Etherfuse (BXTou3) en la wallet.
    // Devolver link + completed (como onboarding) para que Phantom/interstitial abran status page.
    if (!burnTransaction) {
      const mintShort = `${ETHERFUSE_USDC_MINT.slice(0, 6)}…`;
      const walletShort = `${account.slice(0, 6)}…${account.slice(-4)}`;
      // 2–3 líneas ANTES de abrir Etherfuse: Unfunded / Selling Token es esperado sin BXTou3.
      const msg =
        `Orden lista; falta enviar el USDC sandbox (${mintShort}) desde Phantom. ` +
        `Phantom debe tener importada/conectada la wallet ${walletShort}. ` +
        `Si no hay token, la página dirá Unfunded / Selling Token — es normal (no es un error tuyo).`;
      const title = "Orden lista — lee antes de abrir";
      return res.json({
        type: "completed",
        icon: blinkIconUrl(),
        title,
        description: msg,
        label: "Ver seguimiento",
        link: statusPage,
        message: msg,
        links: {
          next: {
            type: "inline",
            action: {
              type: "completed",
              icon: blinkIconUrl(),
              title,
              description: msg,
              label: "Ver seguimiento",
              links: {
                actions: [
                  {
                    type: "external-link",
                    href: statusPage,
                    label: "Abrir seguimiento (después de leer)",
                  },
                ],
              },
            },
          },
        },
      });
    }

    res.json({
      transaction: burnTransaction,
      message: `$${amt} → pesos en tu cuenta bancaria (~15 min). Seguimiento: ${statusPage}`,
      links: {
        next: {
          type: "inline",
          action: {
            type: "completed",
            icon: blinkIconUrl(),
            title: "Burn listo para firmar",
            description: `Tras firmar, sigue el estatus en Etherfuse.`,
            label: "Ver seguimiento",
            links: {
              actions: [
                {
                  type: "external-link",
                  href: statusPage,
                  label: "Abrir seguimiento Etherfuse",
                },
              ],
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("Error convertir-mxn:", err);
    const friendly = mapEtherfuseError(err);
    const status =
      err instanceof EtherfuseUserError &&
      (err.code === "FORBIDDEN" ||
        err.code === "STALE_IDS" ||
        err.code === "TERMS" ||
        err.code === "NON_STABLE" ||
        err.code === "NO_BURN")
        ? 400
        : 500;
    res.status(status).json({ message: friendly });
  }
});

export default router;
