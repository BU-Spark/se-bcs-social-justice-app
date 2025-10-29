import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import nodemailer from "nodemailer";
import ics from "ics";

const prisma = new PrismaClient();

function generateICS(seminar: any) {
  const event = {
    title: seminar.title,
    description: `Hosted by ${seminar.hostName}\n${seminar.zoomLink || ""}`,
    start: [
      new Date(seminar.date).getFullYear(),
      new Date(seminar.date).getMonth() + 1,
      new Date(seminar.date).getDate(),
      new Date(seminar.date).getHours(),
      new Date(seminar.date).getMinutes(),
    ],
    duration: { minutes: seminar.duration || 60 },
    location: seminar.zoomLink ? "Online (Zoom)" : "TBD",
    organizer: { name: "BCS Team", email: process.env.EMAIL_USER },
  };

  const { error, value } = ics.createEvent(event);
  if (error) throw error;
  return value;
}

async function sendEmail({
  to,
  subject,
  body,
  icsContent,
}: {
  to: string;
  subject: string;
  body: string;
  icsContent?: string;
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

  const mailOptions: any = {
    from: `"BCS Team" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: body,
    html: body.replace(/\n/g, "<br>"),
  };

  // Attach ICS calendar invite if provided
  if (icsContent) {
    mailOptions.attachments = [
      {
        filename: "seminar.ics",
        content: icsContent,
        contentType: "text/calendar; charset=utf-8",
        method: "REQUEST",
      },
    ];
  }

  const info = await transporter.sendMail(mailOptions);
  return info.messageId;
}

/**
 * POST: Reserve a seminar seat and send confirmation email
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate Clerk user (optional)
    const { userId: clerkUserId } = await auth();
    const userData = clerkUserId ? await currentUser() : null;

    const { seminarId, user } = await request.json();

    if (!seminarId || !user?.email || !user?.name) {
      return NextResponse.json(
        { error: "Missing required fields: seminarId, user.email, user.name" },
        { status: 400 }
      );
    }

    // Check if seminar exists
    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId },
    });

    if (!seminar) {
      return NextResponse.json({ error: "Seminar not found" }, { status: 404 });
    }

    // Check for duplicate registration
    const existing = await prisma.seminarAttendee.findFirst({
      where: {
        seminarId,
        email: user.email,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already registered for this seminar." },
        { status: 400 }
      );
    }

    // Create new attendee record
    const attendee = await prisma.seminarAttendee.create({
      data: {
        seminarId,
        name: user.name,
        email: user.email,
      },
    });

    // Email body
    const emailBody = `
      Hi ${user.name},

      Your reservation for the seminar "${seminar.title}" has been confirmed!

      📅 Date: ${new Date(seminar.date).toLocaleString()}
      🕓 Duration: ${seminar.duration} minutes
      🎤 Host: ${seminar.hostName}
      🔗 Zoom Link: ${seminar.zoomLink || "Link will be shared soon"}

      We look forward to seeing you there!

      — The BCS Team
      `;

    // Generate calendar event file (.ics)
    const icsContent = generateICS(seminar);

    // Send email with calendar invite
    await sendEmail({
      to: user.email,
      subject: `Seminar Confirmation: ${seminar.title}`,
      body: emailBody,
      icsContent,
    });

    return NextResponse.json(
      { success: true, message: "Reservation confirmed!", attendee },
      { status: 201 }
    );
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
