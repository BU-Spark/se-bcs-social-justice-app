import { checkAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { CommunityMemberStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { communityId: string } },
) {
  try {
    await checkAdmin();

    const { action, userIds } = await req.json();
    const { communityId } = params;

    if (!action || !Array.isArray(userIds) || !communityId) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    await prisma.$transaction(async (prisma) => {
      switch (action) {
        case "ban":
          await prisma.communityMembers.updateMany({
            where: {
              communityId: communityId,
              userId: { in: userIds },
            },
            data: { status: CommunityMemberStatus.banned },
          });
          break;
        case "unban":
          await prisma.communityMembers.updateMany({
            where: {
              communityId: communityId,
              userId: { in: userIds },
            },
            data: { status: CommunityMemberStatus.active },
          });
          break;
        case "remove":
          await prisma.communityMembers.deleteMany({
            where: {
              communityId: communityId,
              userId: { in: userIds },
            },
          });
          break;
        default:
          throw new Error("Invalid action");
      }
    });

    return NextResponse.json({
      message: `Successfully performed ${action} on ${userIds.length} members.`,
    });
  } catch (error: any) {
    if (error.message === "Forbidden: Not an admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
