import { checkAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } },
) {
  try {
    await checkAdmin();
    const { postId } = params;

    await prisma.posting.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: "Post deleted" });
  } catch (error: any) {
    if (error.message === "Access denied") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
