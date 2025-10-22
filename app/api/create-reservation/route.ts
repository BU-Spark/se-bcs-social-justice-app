import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

/**
 * Utility: Send a confirmation email
 */
async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  if (
    !process.env.SMTP_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASSWORD
  ) {
    throw new Error("Missing email configuration in environment variables");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `"BCS Team" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: body,
    html: body.replace(/\n/g, "<br>"),
  });

  return info.messageId;
}

/**
 * POST: Reserve a seminar seat and send confirmation email
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { seminarId, user } = await request.json();
    console.log("Received seminarId:", seminarId);
    console.log("User data:", user);

    if (!seminarId || !user?.email || !user?.name) {
      return NextResponse.json(
        { error: "Missing required fields: seminarId, user.email, user.name" },
        { status: 400 }
      );
    }

    // Ensure user exists in Prisma (use Clerk ID lookup)
    let dbUser = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    // Optional: auto-create user if not present in your DB
    if (!dbUser) {
      console.log("User not found in DB. Creating a new record...");
      dbUser = await prisma.user.create({
        data: {
          clerkUserId,
          email: user.email,
          name: user.name,
          imageUrl: user.imageUrl || null,
        },
      });
    }

    // Fetch seminar appointment
    const seminar = await prisma.appointment.findUnique({
      where: { id: String(seminarId) },
      include: { appointmentType: true },
    });

    if (!seminar) {
      return NextResponse.json({ error: "Seminar not found" }, { status: 404 });
    }

    // Record reservation (use internal User.id, not Clerk ID)
    await prisma.appointmentAttendee.create({
      data: {
        appointmentId: seminar.id,
        userId: dbUser.id, // ✅ Correct foreign key
        email: user.email,
        role: "client",
        additionalComments: user.comments || null,
      },
    });

    // Compose email content
    const emailBody = `
Hi ${user.name},

Your reservation for "${seminar.topic || seminar.appointmentType.title}" has been confirmed!

📅 Date: ${new Date(seminar.startTime).toLocaleString()}
🔗 Join Zoom: ${seminar.zoomLink || "Link not available"}
${user.comments ? `💬 Your comments: ${user.comments}` : ""}

We look forward to seeing you there!

— The BCS Team
`;

    // Send confirmation email
    const messageId = await sendEmail({
      to: user.email,
      subject: `Seminar Reservation Confirmation: ${
        seminar.topic || seminar.appointmentType.title || "Seminar"
      }`,
      body: emailBody,
    });

    return NextResponse.json({
      success: true,
      message: "Reservation confirmed and email sent",
      messageId,
    });
  } catch (error) {
    console.error("❌ Reservation API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to create reservation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
