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

// Configure route for large file uploads
export const runtime = "nodejs"; // Use Node.js runtime (required for large uploads)
export const maxDuration = 60; // Maximum duration in seconds
export const dynamic = "force-dynamic"; // Disable static optimization

/**
 * GET endpoint - Generate presigned URL for direct S3 upload
 * This approach bypasses Next.js body size limits by allowing direct client-to-S3 uploads
 * Used primarily for course management with large video files
 */
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

    // Create command for S3 PUT operation
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileName,
      ContentType: contentType,
    });

    // Generate presigned URL that expires in 1 hour
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const customFolder = formData.get("folder") as string | null;

    if (!fileName || !contentType) {
      return Response.json({ error: "Missing file info" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop();

    // Determine folder structure based on upload context
    let folder: string;

    if (customFolder) {
      // Use custom folder if provided (e.g., courseVideos, courseImage, courseAudio, courseFile)
      folder = customFolder;
    } else {
      // Default seminar behavior
      folder = file.type.startsWith("video") ? "seminarVideo" : "seminarImages";
    }

    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

    // Upload to S3 (no ACL — bucket policy handles public access)
    const uploadParams = {
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
