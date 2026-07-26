import { NextRequest, NextResponse } from "next/server";
import { runLookup } from "@/lib/lookup";
import { DwellingType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_ADDRESS = 5;
/** No legitimate US address approaches this; a longer input is abuse or a bug. */
const MAX_ADDRESS = 200;
const MAX_BODY_BYTES = 2048;

const INVALID = {
  error: `An address between ${MIN_ADDRESS} and ${MAX_ADDRESS} characters is required`,
};

function dwelling(raw: string | null): DwellingType {
  const v = (raw ?? "").toUpperCase();
  return v === "SINGLE_FAMILY" || v === "MULTI_FAMILY_RENTAL" ? v : "UNKNOWN";
}

function validAddress(address: string): boolean {
  return address.length >= MIN_ADDRESS && address.length <= MAX_ADDRESS;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = (searchParams.get("address") ?? "").trim();
  if (!validAddress(address)) {
    return NextResponse.json(INVALID, { status: 422 });
  }
  const result = await runLookup(address, dwelling(searchParams.get("dwelling_type")));
  return NextResponse.json(result, {
    headers: {
      "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

export async function POST(req: NextRequest) {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }

  let body: { address?: string; dwelling_type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const address = (typeof body.address === "string" ? body.address : "").trim();
  if (!validAddress(address)) {
    return NextResponse.json(INVALID, { status: 422 });
  }

  const result = await runLookup(address, dwelling(body.dwelling_type ?? null));
  return NextResponse.json(result, {
    headers: { "x-robots-tag": "noindex, nofollow" },
  });
}
