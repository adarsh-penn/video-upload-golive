import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    const { fileName, contentType } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json({ error: "Missing fileName or contentType" }, { status: 400 });
    }

    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
    const key = `uploads/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 5, // 5 minutes
    });

    return NextResponse.json({ uploadUrl, key });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create presigned URL" }, { status: 500 });
  }
}


