export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    imageUrl?: string | null;
    clerkUserId?: string;
  };
};