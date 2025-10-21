import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import nodemailer from "nodemailer";

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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workshop, user } = await request.json();
    if (!workshop || !user?.email || !user?.name) {
      return NextResponse.json(
        { error: "Missing required fields: workshop and user info" },
        { status: 400 }
      );
    }

    // Generate fake meeting
    const meeting = {
      id: Math.random().toString(36).substring(7),
      topic: workshop.typeName,
      start_time: workshop.date,
      duration: workshop.duration,
      join_url: `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`,
      password: "123456",
    };

    const emailBody = `
    Hi ${user.name},

    Your reservation for "${workshop.typeName}" has been confirmed!

    Join URL: ${meeting.join_url}
    Meeting ID: ${meeting.id}
    Password: ${meeting.password}
    Time: ${meeting.start_time}

    ${user.comments ? `Your comments: ${user.comments}` : ""}

    - The BCS Team
        `;

    // Send email
    await sendEmail({
      to: user.email,
      subject: `Seminar Reservation Confirmation: ${workshop.typeName}`,
      body: emailBody,
    });

    return NextResponse.json({
      success: true,
      meeting,
      message: "Reservation confirmed and email sent",
    });
  } catch (error) {
    console.error(" Reservation API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to create reservation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
