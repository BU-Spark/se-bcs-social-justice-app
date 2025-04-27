"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getCommunityData(communityid: string) {
  const community = await prisma.community.findUnique({
    where: { id: communityid },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
    },
  });

  if (!community) {
    throw new Error("Community not found");
  }

  return community;
}
