import { PrismaClient } from "@prisma/client";

import { communities, postings } from "./mock-data";

const prisma = new PrismaClient();

async function seedcommunities() {
  await prisma.community.deleteMany();
  for (const community of communities) {
    await prisma.community.create({
      data: {
        name: community.name,
        description: community.description,
        imageUrl: community.imageUrl,
        type: community.type,
      },
    });
  }
}

async function seed() {
  const community = await prisma.community.findFirst();
  const user = await prisma.user.findFirst();
  await prisma.posting.deleteMany();
  if (!community || !user) {
    console.error(
      "No community or user found. Please seed communities/users first."
    );
    process.exit(1);
  }

  for (const post of postings) {
    await prisma.posting.create({
      data: {
        title: post.title,
        content: post.content,
        score: post.score,
        communityId: community.id,
        userId: user.id,
      },
    });
  }
}
seedcommunities();
