import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { CommunityMemberStatus } from "@prisma/client";
import { NextResponse } from "next/server";

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
          some: { userId: localUser.id, status: CommunityMemberStatus.active },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        type: true,
        _count: {
          select: { members: true },
        },
        members: {
          take: 3,
          include: {
            user: {
              select: {
                username: true,
                imageUrl: true,
              },
            },
          },
        },
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
        _count: {
          select: { members: true },
        },
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

export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const localUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });

    if (!localUser) {
      return NextResponse.json(
        { error: "User not found in the database" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { name, description, imageUrl, category } = body;

    const existingCommunity = await prisma.community.findUnique({
      where: { name },
    });

    if (existingCommunity) {
      return NextResponse.json(
        { error: "A community with this name already exists" },
        { status: 409 },
      );
    }

    const newCommunity = await prisma.community.create({
      data: {
        name,
        description: description || null,
        imageUrl: imageUrl || null,
        type: category,
        members: {
          create: {
            userId: localUser.id,
          },
        },
      },
    });

    await prisma.user.update({
      where: { id: localUser.id },
      data: { role: "leader" },
    });

    return NextResponse.json(newCommunity, { status: 201 });
  } catch (error) {
    console.error("Error creating community:", error);
    return NextResponse.json(
      { error: "Failed to create community" },
      { status: 500 },
    );
  }
}
