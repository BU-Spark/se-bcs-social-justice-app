export type Community = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
};

export type CommunitiesData = {
  joinedCommunities: Community[];
  recommendedCommunities: Community[];
};
