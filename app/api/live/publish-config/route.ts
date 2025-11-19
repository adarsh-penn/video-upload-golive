import { NextResponse } from "next/server";

export async function GET() {
  const ingestEndpointHost = process.env.NEXT_PUBLIC_IVS_INGEST_ENDPOINT_HOST;
  const streamKey = process.env.NEXT_PUBLIC_IVS_STREAM_KEY;

  if (!ingestEndpointHost || !streamKey) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_IVS_INGEST_ENDPOINT_HOST or NEXT_PUBLIC_IVS_STREAM_KEY not set" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ingestEndpointHost,
    streamKey,
  });
}

