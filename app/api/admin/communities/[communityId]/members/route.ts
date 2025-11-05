import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { communityId: string } },
) {
  try {
    const { communityId } = await params;
    if (!communityId) {
      return new NextResponse("Community ID missing", { status: 400 });
    }

    const members = await prisma.communityMembers.findMany({
      where: {
        communityId: communityId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error Getting Community Members List", error);
    return NextResponse.json(
      { error: "Error Getting Community Members List" },
      { status: 403 },
    );
  }
}
