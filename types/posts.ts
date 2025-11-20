export type Post = {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
  score: number;
  _count?: {
    comments: number;
  };
  imageUrl: string | null;
  pdfUrl: string | null;
  currentUserVote?: "UPVOTE" | "DOWNVOTE" | null;
  user?: {
    id: string;
    clerkUserId: string;
    name: string | null;
    imageUrl?: string | null;
  };
};