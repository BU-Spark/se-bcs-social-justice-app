import { checkAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { PostingStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await checkAdmin();

    const { action, postIds } = await req.json();

    if (!action || !Array.isArray(postIds)) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    await prisma.$transaction(async (prisma) => {
      switch (action) {
        case "approve":
          await prisma.posting.updateMany({
            where: {
              id: { in: postIds },
            },
            data: { status: PostingStatus.active },
          });
          break;
        case "delete":
          await prisma.posting.deleteMany({
            where: {
              id: { in: postIds },
            },
          });
          break;
        default:
          throw new Error("Invalid action");
      }
    });

    return NextResponse.json({
      message: `Successfully performed ${action} on ${postIds.length} posts.`,
    });
  } catch (error: any) {
    if (error.message === "Forbidden: Not an admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
