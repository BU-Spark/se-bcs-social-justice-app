import { can } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { communityid: string } },
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse("User Not Found", { status: 404 });
    }

    const communityId = params.communityid;

    const [canView, canPost, canComment, canModerate] = await Promise.all([
      can(user.id, communityId, "canView"),
      can(user.id, communityId, "canPost"),
      can(user.id, communityId, "canComment"),
      can(user.id, communityId, "canModerate"),
    ]);

    return NextResponse.json({ canView, canPost, canComment, canModerate });
  } catch (error) {
    console.error("[PERMISSIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
