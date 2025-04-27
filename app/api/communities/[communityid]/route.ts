import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { communityid: string } }
) {
  try {
    const community = await prisma.community.findUnique({
      where: { id: params.communityid },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
      },
    });

    if (!community) {
      return NextResponse.json(
        { message: "Community not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(community);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
