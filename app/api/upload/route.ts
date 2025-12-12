import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const runtime = "nodejs";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("fileName");
    const contentType = searchParams.get("contentType");

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "Missing fileName or contentType" },
        { status: 400 },
      );
    }

    const Bucket = process.env.S3_BUCKET_NAME!;
    const command = new PutObjectCommand({
      Bucket,
      Key: fileName,
      ContentType: contentType,
    });

    // Signed URL
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    // Public URL
    const publicUrl = `${process.env.S3_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (err) {
    console.error("Signed URL Error:", err);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 },
    );
  }
}
