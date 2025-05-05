import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const localUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
      select: {
        id: true,
        role: true,
        leaderApplication: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!localUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      userRole: localUser.role.toLowerCase(),
      leaderApplication: localUser.leaderApplication,
    });
  } catch (error) {
    console.error("Error fetching leader application status:", error);
    return NextResponse.json(
      { error: "Failed to fetch leader application status" },
      { status: 500 }
    );
  }
}
