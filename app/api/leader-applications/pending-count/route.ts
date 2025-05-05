import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
      select: { role: true },
    });

    if (!dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const pendingCount = await prisma.leaderApplication.count({
      where: { status: "PENDING" },
    });

    return NextResponse.json({ count: pendingCount });
  } catch (error) {
    console.error("Error fetching pending applications count:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending applications count" },
      { status: 500 }
    );
  }
}
