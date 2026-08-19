import { NextResponse } from "next/server";
import { ACTIONS_CORS_HEADERS, actionsJson } from "@/lib/solana-action";
import { getPublicSiteUrl } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ACTIONS_CORS_HEADERS });
}

export function GET() {
  return NextResponse.json(actionsJson(getPublicSiteUrl()), {
    headers: ACTIONS_CORS_HEADERS,
  });
}
