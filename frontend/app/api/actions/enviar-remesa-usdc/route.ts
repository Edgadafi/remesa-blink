import { NextRequest, NextResponse } from "next/server";
import {
  ACTIONS_CORS_HEADERS,
  enviarRemesaUsdcGetResponse,
  getBlinksUpstream,
} from "@/lib/solana-action";
import { getPublicSiteUrl } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: ACTIONS_CORS_HEADERS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ACTIONS_CORS_HEADERS });
}

export function GET() {
  return json(enviarRemesaUsdcGetResponse(getPublicSiteUrl()));
}

export async function POST(req: NextRequest) {
  const upstream = getBlinksUpstream();
  if (!upstream || upstream.includes("localhost") || upstream.includes("127.0.0.1")) {
    if (process.env.VERCEL) {
      return json(
        {
          error: {
            message:
              "El Blink se abre aquí (HTTPS holatia.app). Firmar la transacción en Phantom necesita el API local en devnet.",
          },
        },
        503
      );
    }
  }
  if (!upstream) {
    return json(
      {
        error: {
          message:
            "Falta BLINKS_UPSTREAM_URL / API_URL para firmar. El GET del Blink (unfurl) sí está en holatia.app.",
        },
      },
      503
    );
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    const res = await fetch(`${upstream}/api/actions/enviar-remesa-usdc`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as unknown;
    return json(data, res.status);
  } catch {
    return json(
      {
        error: {
          message:
            "No se alcanzó el API para firmar. El comprobante (GET) sigue en holatia.app.",
        },
      },
      502
    );
  }
}
