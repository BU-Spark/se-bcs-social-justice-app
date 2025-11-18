import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      memberships: {
        select: {
          community: { select: { id: true, name: true } },
        },
      },
      subscriptions: {
        where: { isActive: true },
        select: {
          tier: { select: { id: true, tierName: true } },
        },
      },
    },
  });

  return NextResponse.json({
    communities: user?.memberships?.map((m) => m.community) || [],
    tiers: user?.subscriptions?.map((s) => s.tier) || [],
  });
}
