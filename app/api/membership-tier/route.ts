import { NextResponse } from "next/server";
import prisma from "@/lib/db"; // make sure this matches your prisma import path

export async function GET() {
  try {
    const tiers = await prisma.membershipTier.findMany({
      select: {
        id: true,
        tierName: true,
        monthlyPrice: true,
        annualPrice: true,
        description: true,
        isActive: true,
      },
      where: {
        isActive: true, // only show active tiers
      },
      orderBy: {
        monthlyPrice: "asc",
      },
    });

    return NextResponse.json(tiers, { status: 200 });
  } catch (error) {
    console.error("Error fetching membership tiers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
