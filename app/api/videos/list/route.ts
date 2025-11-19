import { NextResponse } from "next/server";
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3";

export async function GET() {
  try {
    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
    const listCmd = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: "uploads/",
    });

    const resp = await s3Client.send(listCmd);
    const contents = resp.Contents ?? [];

    const items = await Promise.all(
      contents.map(async (o) => {
        if (!o.Key) return null;

        const getCmd = new GetObjectCommand({
          Bucket: bucket,
          Key: o.Key,
        });

        const playbackUrl = await getSignedUrl(s3Client, getCmd, {
          expiresIn: 60 * 10, // 10 minutes
        });

        return {
          key: o.Key,
          lastModified: o.LastModified,
          size: o.Size,
          playbackUrl,
        };
      })
    );

    return NextResponse.json({ items: items.filter(Boolean) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to list videos" }, { status: 500 });
  }
}


