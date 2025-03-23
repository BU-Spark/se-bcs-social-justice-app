import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const groups = await prisma.memberships.findMany({
      select: { name: true },
    });

    return NextResponse.json(memberships, { status: 200 });
  } catch (error) {
    console.error("Error fetching memberships:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}