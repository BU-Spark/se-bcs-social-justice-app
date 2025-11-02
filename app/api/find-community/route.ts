import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { communityid: string } },
) {
  const community = await prisma.community.findUnique({
    where: { id: params.communityid },
    select: { id: true, name: true, description: true, imageUrl: true },
  });
  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }
  return NextResponse.json(community, { status: 200 });
}
