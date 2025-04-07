"use server";

import prisma from "@/lib/db";
import { z } from "zod";
import { redirect } from "next/navigation";

const createPostSchema = z.object({
  communityId: z.string().nonempty("Community ID is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export async function createPost(formData: FormData) {
  const communityId = formData.get("communityId")?.toString() || "";
  const title = formData.get("title")?.toString() || "";
  const content = formData.get("content")?.toString() || "";

  console.log("Received form data:", { communityId, title, content });

  const validatedData = createPostSchema.parse({ communityId, title, content });

  const userId = "some_existing_user_id";

  await prisma.posting.create({
    data: {
      communityId: validatedData.communityId,
      title: validatedData.title,
      content: validatedData.content,
      userId,
    },
  });

  return redirect(`/communities/${validatedData.communityId}`);
}
