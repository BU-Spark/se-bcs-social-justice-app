export type Community = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
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

export type CommunityWithMemberCount = Community & {
  _count: {
    members: number;
  };
};

export type CommunitiesData = {
  joinedCommunities: Community[];
  recommendedCommunities: Community[];
};
