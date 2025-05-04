import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let localUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });

    if (!localUser) {
      localUser = await prisma.user.create({
        data: {
          clerkUserId: clerkUser.id,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
          name: clerkUser.fullName || "",
        },
      });
    }

    const joinedCommunities = await prisma.community.findMany({
      where: {
        members: {
          some: { userId: localUser.id },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        type: true,
      },
    });

    const recommendedCommunities = await prisma.community.findMany({
      where: {
        NOT: {
          members: {
            some: { userId: localUser.id },
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        type: true,
      },
    });

    return NextResponse.json(
      { joinedCommunities, recommendedCommunities },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
