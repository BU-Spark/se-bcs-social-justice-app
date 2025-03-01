import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const interests = await prisma.interest.findMany({
      select: { name: true },
    });

    return NextResponse.json(interests, { status: 200 });
  } catch (error) {
    console.error("Error fetching interests:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
