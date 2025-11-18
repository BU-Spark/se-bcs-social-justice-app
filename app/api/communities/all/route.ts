import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Return all communities
    const communities = await prisma.community.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        type: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(communities, { status: 200 });
  } catch (error) {
    console.error("Error fetching all communities:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
