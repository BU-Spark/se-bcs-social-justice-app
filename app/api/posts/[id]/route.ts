import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deletedPost = await prisma.posting.delete({
      where: { id: params.id },
    });
    return NextResponse.json(deletedPost, { status: 200 });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
