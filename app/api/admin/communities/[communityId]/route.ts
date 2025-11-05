import { checkAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { communityId: string } },
) {
  const { communityId } = params;
  try {
    await checkAdmin();
    await prisma.community.delete({ where: { id: communityId } });
    return NextResponse.json({ message: "Community deleted" });
  } catch (error: any) {
    if (error.message === "Forbidden: Not an admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}