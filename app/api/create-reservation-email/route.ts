import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import ics from "ics";

// calendarLlink
function generateCalendarLinks(seminar: any) {
  const start = new Date(seminar.date);
  const end = new Date(start.getTime() + (seminar.duration || 60) * 60000);

  const startISO = start.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const endISO = end.toISOString().replace(/[-:]|\.\d{3}/g, "");

  const title = encodeURIComponent(seminar.title);
  const description = encodeURIComponent(
    `Hosted by ${seminar.hostName}\n${seminar.zoomLink || ""}`
  );
  const location = encodeURIComponent(seminar.zoomLink || "Online (Zoom)");

  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${description}&location=${location}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${description}&startdt=${startISO}&enddt=${endISO}&location=${location}`,
    yahoo: `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${title}&st=${startISO}&et=${endISO}&desc=${description}&in_loc=${location}`,
  };
}

// ical
function generateICS(seminar: any) {
  const start = new Date(seminar.date);
  const event = {
    title: seminar.title,
    description: `Hosted by ${seminar.hostName}\n${seminar.zoomLink || ""}`,
    start: [
      start.getFullYear(),
      start.getMonth() + 1,
      start.getDate(),
      start.getHours(),
      start.getMinutes(),
    ],
    duration: { minutes: seminar.duration || 60 },
    location: seminar.zoomLink || "Online (Zoom)",
    organizer: { name: "BCS Team", email: process.env.EMAIL_USER },
  };

  const { error, value } = ics.createEvent(event);
  if (error) throw error;
  return value;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const seminar = {
      title: searchParams.get("title") || "Seminar",
      date: searchParams.get("date"),
      duration: Number(searchParams.get("duration") || 60),
      hostName: searchParams.get("hostName") || "Host",
      zoomLink: searchParams.get("zoomLink") || "Online (Zoom)",
    };

    if (!seminar.date) {
      return NextResponse.json(
        { error: "Missing 'date' parameter" },
        { status: 400 }
      );
    }

    const icsContent = generateICS(seminar);

    return new NextResponse(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          seminar.title
        )}.ics"`,
      },
    });
  } catch (err) {
    console.error("❌ iCal generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate iCal file" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { to, seminar, user } = await req.json();
    if (!to || !seminar || !user?.name)
      return NextResponse.json(
        { error: "Missing fields: to, seminar, or user" },
        { status: 400 }
      );

    const host = req.headers.get("host");
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const origin = `${protocol}://${host}`;

    const icsDownloadUrl = `${origin}/api/create-reservation-email?title=${encodeURIComponent(
      seminar.title
    )}&date=${encodeURIComponent(seminar.date)}&duration=${
      seminar.duration
    }&hostName=${encodeURIComponent(
      seminar.hostName
    )}&zoomLink=${encodeURIComponent(seminar.zoomLink || "")}`;

    const links = generateCalendarLinks(seminar);

    const calendarLinks = `
      <a href="${icsDownloadUrl}">iCal (.ics)</a><br/>
      <a href="${links.google}">Google</a> ·
      <a href="${links.outlook}">Outlook</a> ·
      <a href="${links.yahoo}">Yahoo</a>
    `;

    const emailBody = `
      <p>Hi ${user.name},</p>
      <p>Your reservation for the seminar <strong>${seminar.title}</strong> has been confirmed!</p>
      <p>
        📅 <strong>Date:</strong> ${new Date(seminar.date).toLocaleString()}<br/>
        🕓 <strong>Duration:</strong> ${seminar.duration} minutes<br/>
        🎤 <strong>Host:</strong> ${seminar.hostName}<br/>
        🔗 <strong>Zoom:</strong> <a href="${seminar.zoomLink || "#"}">${
          seminar.zoomLink || "Link coming soon"
        }</a>
      </p>
      <p><strong>Add to your calendar:</strong><br/>${calendarLinks}</p>
      <p>We look forward to seeing you there!<br/>— The BCS Team</p>
    `;
    
    //Verify SMTP
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASSWORD
    ) {
      throw new Error("Missing SMTP configuration");
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
      subject: `Seminar Confirmation: ${seminar.title}`,
      html: emailBody,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error("❌ Email Error:", err);
    return NextResponse.json(
      {
        error: "Failed to send email",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
