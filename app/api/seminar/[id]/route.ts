import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// Fetch a single seminar (with attendees)
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const seminar = await prisma.seminar.findUnique({
      where: { id },
      include: {
        attendees: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        accessRules: {
          select: {
            id: true,
            accessScope: true,
            price: true,
            communityId: true,
            tierId: true,
            community: { select: { name: true } },
            tier: { select: { tierName: true } },
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
      { status: 500 },
    );
  }
}

// Update seminar (admin only)
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
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

    // Update seminar core fields
    await prisma.seminar.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        hostName: data.hostName,
        date: data.date ? new Date(data.date) : undefined,
        duration: data.duration ? Number(data.duration) : undefined,
        zoomLink: data.zoomLink,
        image: data.image || null,
        mediaUrl: data.mediaUrl || null,
      },
    });

    // Update access rules (replace existing)
    if (Array.isArray(data.accessRules)) {
      await prisma.seminarAccessRule.deleteMany({ where: { seminarId: id } });

      for (const rule of data.accessRules) {
        const parsedPrice =
          rule.price && !isNaN(parseFloat(rule.price))
            ? parseFloat(rule.price)
            : null;

        await prisma.seminarAccessRule.create({
          data: {
            seminarId: id,
            accessScope: rule.accessScope,
            communityId: rule.communityId || null,
            tierId: rule.tierId || null,
            price: parsedPrice,
          },
        });
      }
    }

    // Return seminar with updated accessRules
    const seminarWithRules = await prisma.seminar.findUnique({
      where: { id },
      include: {
        attendees: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
        accessRules: {
          select: {
            id: true,
            accessScope: true,
            price: true,
            communityId: true,
            tierId: true,
          },
        },
      },
    });

    return NextResponse.json(seminarWithRules);
  } catch (err) {
    console.error("❌ Error updating seminar:", err);
    return NextResponse.json(
      { error: "Failed to update seminar" },
      { status: 500 },
    );
  }
}

// Delete seminar (admin only)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

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

    await prisma.seminar.delete({ where: { id } });

    return NextResponse.json({ message: "Seminar deleted successfully" });
  } catch (err) {
    console.error("Error deleting seminar:", err);
    return NextResponse.json(
      { error: "Failed to delete seminar" },
      { status: 500 },
    );
  }
}
