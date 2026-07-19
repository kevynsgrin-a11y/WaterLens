import { NextRequest, NextResponse } from "next/server";
import { runLookup } from "@/lib/lookup";
import { DwellingType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dwelling(raw: string | null): DwellingType {
  const v = (raw ?? "").toUpperCase();
  return v === "SINGLE_FAMILY" || v === "MULTI_FAMILY_RENTAL" ? v : "UNKNOWN";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = (searchParams.get("address") ?? "").trim();
  if (address.length < 5) {
    return NextResponse.json(
      { error: "A valid US residential address or ZIP is required" },
      { status: 422 }
    );
  }
  const result = await runLookup(address, dwelling(searchParams.get("dwelling_type")));
  return NextResponse.json(result, {
    headers: { "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}

export async function POST(req: NextRequest) {
  let body: { address?: string; dwelling_type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const address = (body.address ?? "").trim();
  if (address.length < 5) {
    return NextResponse.json(
      { error: "A valid US residential address or ZIP is required" },
      { status: 422 }
    );
  }
  const result = await runLookup(address, dwelling(body.dwelling_type ?? null));
  return NextResponse.json(result);
}
