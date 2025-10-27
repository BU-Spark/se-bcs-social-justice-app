import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// GET: Fetch a single seminar (with attendees)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const seminar = await prisma.seminar.findUnique({
      where: { id: params.id },
      include: {
        attendees: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!seminar) {
      return NextResponse.json({ error: "Seminar not found" }, { status: 404 });
    }

    return NextResponse.json(seminar);
  } catch (err) {
    console.error("Error fetching seminar:", err);
    return NextResponse.json(
      { error: "Failed to fetch seminar" },
      { status: 500 }
    );
  }
}

// PUT: Update seminar (admin only)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();

    const updated = await prisma.seminar.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        hostName: data.hostName,
        date: data.date ? new Date(data.date) : undefined,
        duration: data.duration ? Number(data.duration) : undefined,
        zoomLink: data.zoomLink,
        accessType: data.accessType ?? "public",
        image: data.image || null,
        mediaUrl: data.mediaUrl || null,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating seminar:", err);
    return NextResponse.json(
      { error: "Failed to update seminar" },
      { status: 500 }
    );
  }
}

// DELETE: Delete seminar (admin only)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.seminar.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Seminar deleted successfully" });
  } catch (err) {
    console.error("Error deleting seminar:", err);
    return NextResponse.json(
      { error: "Failed to delete seminar" },
      { status: 500 }
    );
  }
}
