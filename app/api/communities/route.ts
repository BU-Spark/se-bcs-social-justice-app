// app/api/communities/route.ts
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Get Clerk authenticated user
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch or create the local user based on Clerk's user id
    let localUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });

    // (Optional) If user record not found, you may decide to create one or return an error:
    if (!localUser) {
      localUser = await prisma.user.create({
        data: {
          clerkUserId: clerkUser.id,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
          name: clerkUser.fullName || "",
        },
      });
    }

    // Use the local user's id to query memberships
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
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
