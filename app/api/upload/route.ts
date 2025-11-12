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
      return Response.json({ error: "Missing file info" }, { status: 400 });
    }

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileName,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return Response.json({ url: signedUrl });
  } catch (err: any) {
    console.error("❌ Error generating signed URL:", err);
    return Response.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}
