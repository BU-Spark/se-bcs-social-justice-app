import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const interests = await prisma.interest.findMany({
      select: {
        id: true,
        name: true,
        communities: {
          select: {
            community: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                description: true,
              },
            },
          },
        },
      },
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
