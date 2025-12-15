import prisma from "@/lib/prisma";
import {
  CommunityMemberStatus,
  CommunityRole,
  CommunityType,
  UserRole,
} from "@prisma/client";

const rules = {
  // Global Admin
  [UserRole.admin]: {
    canView: true,
    canPost: true,
    canComment: true,
    canModerate: true,
  },

  [CommunityType.GENERAL]: {
    [CommunityRole.MEMBER]: {
      canView: true,
      canPost: true,
      canComment: true,
      canModerate: false,
    },
    [CommunityRole.LEADER]: {
      canView: true,
      canPost: true,
      canComment: true,
      canModerate: true,
    },
    [CommunityRole.ADMIN]: {
      canView: true,
      canPost: true,
      canComment: true,
      canModerate: true,
    },
  },

  [CommunityType.ANNOUNCEMENT]: {
    [CommunityRole.MEMBER]: {
      canView: true,
      canPost: false,
      canComment: false,
      canModerate: false,
    },
    [CommunityRole.LEADER]: {
      canView: true,
      canPost: false,
      canComment: false,
      canModerate: false,
    },
    [CommunityRole.ADMIN]: {
      canView: true,
      canPost: true,
      canComment: true,
      canModerate: true,
    },
  },
};

// See if a user has the necessary permissions
export async function can(
  userId: string,
  communityId: string,
  action: "canView" | "canPost" | "canComment" | "canModerate",
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role === UserRole.admin) {
    return rules[UserRole.admin][action] || false;
  }

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { accessType: true },
  });

  if (!community) return false;

  //Uses CommunityLeader model
  const legacyLeader = await prisma.communityLeader.findFirst({
    where: { userId: userId, communityId: communityId },
  });

  if (legacyLeader) {
    return (
      rules[community.accessType]?.[CommunityRole.LEADER]?.[action] || false
    );
  }

  const membership = await prisma.communityMembers.findFirst({
    where: {
      userId: userId,
      communityId: communityId,
      status: CommunityMemberStatus.active,
    },
    select: { role: true },
  });

  if (!membership) return false;

  const permission = rules[community.accessType]?.[membership.role]?.[action];

  return permission || false;
}
