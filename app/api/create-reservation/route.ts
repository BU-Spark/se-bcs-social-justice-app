import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { POST as sendEmailHandler } from "@/app/api/create-reservation-email/route"; // internal import ✅

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // ✅ Clerk authentication (optional)
    const { userId: clerkUserId } = await auth();
    const userData = clerkUserId ? await currentUser() : null;

    const { seminarId, user } = await request.json();

    // ✅ Validate required fields
    if (!seminarId || !user?.email || !user?.name) {
      return NextResponse.json(
        { error: "Missing required fields: seminarId, user.email, user.name" },
        { status: 400 }
      );
    }

    // ✅ Find seminar
    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId },
    });
    if (!seminar) {
      return NextResponse.json({ error: "Seminar not found" }, { status: 404 });
    }

    // ✅ Prevent duplicate registration
    const existing = await prisma.seminarAttendee.findFirst({
      where: { seminarId, email: user.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You have already registered for this seminar." },
        { status: 400 }
      );
    }

    // ✅ Create attendee record
    const attendee = await prisma.seminarAttendee.create({
      data: {
        seminarId,
        name: user.name,
        email: user.email,
      },
    });

    // ✅ Build headers for internal call (important!)
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";

    // ✅ Create internal Request object for sendEmailHandler
    const emailReq = new Request(
      `${protocol}://${host}/api/create-reservation-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          host,
          "x-forwarded-proto": protocol,
        },
        body: JSON.stringify({
          to: user.email,
          seminar,
          user,
        }),
      }
    );

    // ✅ Call the internal email handler directly
    const emailRes = await sendEmailHandler(emailReq);
    const emailData = await emailRes.json();

    if (!emailData.success) {
      console.error("⚠️ Email sending failed:", emailData);
    }

    // ✅ Return success
    return NextResponse.json(
      {
        success: true,
        message: "Reservation confirmed! Confirmation email sent.",
        attendee,
      },
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
