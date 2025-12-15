import { checkAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { wordId: string } },
) {
  try {
    await checkAdmin();
    const wordId = params.wordId;
    await prisma.bannedWord.delete({
      where: { id: wordId },
    });
    return NextResponse.json({ message: "Word removed" });
  } catch (error: any) {
    return new NextResponse("Error deleting word from list", { status: 500 });
  }
}
