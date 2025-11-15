"use server";

import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { CommunityMemberStatus } from "@prisma/client";

export async function joinCommunity(communityId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error("User not authenticated");
  }

  let localUser = await prisma.user.findUnique({
    where: { clerkUserId: clerkUser.id },
  });

  if (!localUser) {
    localUser = await prisma.user.create({
      data: {
        clerkUserId: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
        name: clerkUser.fullName || "",
      },
    });
  }

  const existingMembership = await prisma.communityMembers.findUnique({
    where: {
      userId_communityId: {
        userId: localUser.id,
        communityId,
      },
    },
  });

  if (existingMembership) {
    if (existingMembership.status === CommunityMemberStatus.banned) {
      throw new Error("You are banned from this community and cannot join.");
    }
    return existingMembership;
  }

  return await prisma.communityMembers.create({
    data: {
      userId: localUser.id,
      communityId,
      status: CommunityMemberStatus.active,
    },
  });
}

export async function unjoinCommunity(communityId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error("User not authenticated");
  }

  const localUser = await prisma.user.findUnique({
    where: { clerkUserId: clerkUser.id },
  });

  if (!localUser) {
    throw new Error("Local user record not found");
  }

  return await prisma.communityMembers.delete({
    where: {
      userId_communityId: {
        userId: localUser.id,
        communityId,
      },
    },
  });
}
