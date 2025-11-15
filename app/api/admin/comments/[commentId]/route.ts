import { checkAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { commentId: string } },
) {
  try {
    await checkAdmin();
    const { commentId } = params;

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "Comment deleted" });
  } catch (error: any) {
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
