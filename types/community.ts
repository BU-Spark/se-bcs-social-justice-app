export type Community = {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
  type: string;
};

export type CommunitiesData = {
  joinedCommunities: Community[];
  recommendedCommunities: Community[];
};
