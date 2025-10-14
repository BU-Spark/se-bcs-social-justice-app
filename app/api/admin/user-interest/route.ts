import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const interestId = searchParams.get("interest");

    // If specific interest is requested, filter by it
    const whereClause = interestId
      ? {
          interests: {
            some: {
              interestId: interestId,
            },
          },
        }
      : {};

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        interests: {
          include: {
            interest: true,
          },
        },
        memberships: {
          include: {
            community: true,
          },
        },
      },
    });

    // Fetch all available interests
    const allInterests = await prisma.interest.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // Transform data to include communities array
    const usersWithCommunityStatus = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      imageUrl: user.imageUrl,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      interests: user.interests,
      communities: user.memberships.map((m) => ({
        id: m.community.id,
        name: m.community.name,
        type: m.community.type,
        imageUrl: m.community.imageUrl,
        description: m.community.description,
      })),
    }));

    return NextResponse.json({
      users: usersWithCommunityStatus,
      allInterests,
    });
  } catch (error) {
    console.error("Error fetching users by interest:", error);
    return NextResponse.json(
      { error: "Error fetching users" },
      { status: 500 }
    );
  }
}
