import { checkAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await checkAdmin();
    const { word } = await req.json();
    if (!word) return new NextResponse("Word is required", { status: 400 });

    const newWord = await prisma.bannedWord.create({
      data: { word: word.toLowerCase() },
    });
    return NextResponse.json(newWord);
  } catch (error: any) {
    if (error.code === "P2002") { //prisma unique constraint error code
      return new NextResponse("Word already in list", { status: 409 });
    }
  }
}
