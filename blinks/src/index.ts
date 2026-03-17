/**
 * Servidor Blinks - Remesa Blink
 * Endpoint de acción: enviar-remesa
 */
import "dotenv/config";
import express from "express";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const app = express();
const PORT = process.env.PORT || 3001;
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

app.use(express.json());

// CORS para Blinks
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.options("*", (_req, res) => res.sendStatus(204));

// actions.json para descubrimiento
app.get("/actions.json", (_req, res) => {
  const base = process.env.BLINKS_BASE_URL || `http://localhost:${PORT}`;
  res.json({
    actions: [
      {
        url: `${base}/api/actions/enviar-remesa`,
        label: "Enviar Remesa",
        description: "Transferir SOL a una wallet de destino",
      },
    ],
  });
});

/**
 * GET: Metadatos del Blink para clientes
 */
app.get("/api/actions/enviar-remesa", (_req, res) => {
  res.json({
    label: "Enviar Remesa",
    icon: "https://solana.com/favicon.ico",
    description: "Transferir SOL a una wallet de destino",
    actions: [
      {
        label: "Enviar",
        href: `${process.env.BLINKS_BASE_URL || `http://localhost:${PORT}`}/api/actions/enviar-remesa`,
        parameters: [
          {
            name: "account",
            label: "Tu wallet",
            required: true,
          },
          {
            name: "amount",
            label: "Monto (SOL)",
            required: true,
          },
          {
            name: "destination",
            label: "Wallet destino",
            required: true,
          },
        ],
      },
    ],
  });
});

/**
 * POST: Construye y devuelve la transacción firmable
 */
app.post("/api/actions/enviar-remesa", async (req, res) => {
  try {
    const { account, amount, destination } = req.body;

    if (!account || !amount || !destination) {
      return res.status(400).json({
        error: "account, amount y destination son requeridos",
      });
    }

    const fromPubkey = new PublicKey(account);
    const toPubkey = new PublicKey(destination);
    const lamports = Math.round(parseFloat(amount) * LAMPORTS_PER_SOL);

    if (lamports <= 0) {
      return res.status(400).json({ error: "Monto debe ser positivo" });
    }

    const connection = new Connection(RPC_URL);
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      })
    );

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = fromPubkey;

    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    const base64 = serialized.toString("base64");

    res.json({
      transaction: base64,
      message: `Transferir ${amount} SOL a ${destination}`,
    });
  } catch (err) {
    console.error("Error enviar-remesa:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Error al crear transacción",
    });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Blinks server en http://localhost:${PORT}`);
});
