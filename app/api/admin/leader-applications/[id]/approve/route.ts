import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const application = await prisma.leaderApplication.update({
      where: { id: params.id },
      data: { status: "APPROVED" },
    });

    await prisma.user.update({
      where: { id: application.userId },
      data: { role: "leader" },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Error approving application:", error);
    return NextResponse.json(
      { error: "Error approving application" },
      { status: 500 }
    );
  }
}
