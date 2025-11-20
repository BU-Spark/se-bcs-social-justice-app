export type BaseCommunity = {
  id: string;
  name: string;
  description: string | null;
  imageUrl?: string | null;
};

export type Community = BaseCommunity & {
  _count: {
    members: number;
  };
  members: {
    user: {
      username: string;
      imageUrl: string | null;
    };
  }[];
};

export type CommunityWithMemberCount = BaseCommunity & {
  _count: {
    members: number;
  };
};

export type CommunitiesData = {
  joinedCommunities: Community[];
  recommendedCommunities: Community[];
};

export type CommunityPermissions = {
  canView: boolean;
  canPost: boolean;
  canComment: boolean;
  canModerate: boolean;
};