import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop();

    // Optional: organize by type (e.g. seminarImages or seminarVideo)
    const folder = file.type.startsWith("video")
      ? "seminarVideo"
      : "seminarImages";
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

    // Upload to S3 (no ACL — bucket policy handles public access)
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    // Construct public URL manually
    const fileUrl = `https://${process.env.AWS_S3_BUCKET!}.s3.${process.env.AWS_REGION!}.amazonaws.com/${fileName}`;

    return NextResponse.json({ url: fileUrl });
  } catch (err) {
    console.error("S3 upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
