import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const playbackUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 10, // 10 minutes
    });

    return NextResponse.json({ playbackUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create playback URL" }, { status: 500 });
  }
}


