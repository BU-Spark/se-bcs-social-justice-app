import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { communityId } = await req.json();

    if (!communityId)
      return NextResponse.json(
        { error: "Community ID is required" },
        { status: 400 }
      );

    const existingMembership = await prisma.communityMembers.findUnique({
      where: {
        userId_communityId: {
          userId: user.id,
          communityId,
        },
      },
    });

    if (!existingMembership)
      return NextResponse.json(
        { error: "User is not a member of this community" },
        { status: 400 }
      );

    await prisma.communityMembers.delete({
      where: {
        userId_communityId: {
          userId: user.id,
          communityId,
        },
      },
    });

    return NextResponse.json(
      { message: "Successfully unjoined the community" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error unjoining community:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
