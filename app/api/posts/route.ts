import { checkAdmin } from "@/lib/admin-auth";
import { currentUser } from "@clerk/nextjs/server";
import { PostingStatus, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const prisma = new PrismaClient();

const createPostSchema = z.object({
  communityId: z.string().nonempty("Community ID is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  imageUrl: z.string().nullable().optional(),
  pdfUrl: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get("communityId");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  if (!communityId) {
    return NextResponse.json({ error: "Missing communityId" }, { status: 400 });
  }

  const skip = (page - 1) * pageSize;

  const isAdmin = await checkAdmin();
  const whereClause: any = {
    communityId: communityId,
  };

  //admin can see flagged posts while normal user can't
  if (!isAdmin) {
    whereClause.status = PostingStatus.active;
  } else {
    whereClause.status = {
      in: [PostingStatus.active, PostingStatus.flagged],
    };
  }

  try {
    const posts = await prisma.posting.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        user: {
          select: { id: true, clerkUserId: true, name: true, imageUrl: true },
        },
      },
    });

    const totalPosts = await prisma.posting.count({ where: { communityId } });
    const totalPages = Math.ceil(totalPosts / pageSize);

    return NextResponse.json(
      {
        posts,
        totalPages,
        totalPosts,
        hasMore: page < totalPages,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedData = createPostSchema.parse(body);
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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

    const bannedWords = await prisma.bannedWord.findMany();
    const blocklist = bannedWords.map((bw) => bw.word.toLowerCase());

    const postContent = (
      parsedData.title +
      " " +
      (parsedData.content || "")
    ).toLowerCase();
    const isFlagged = blocklist.some((word) => postContent.includes(word));
    const postStatus = isFlagged ? PostingStatus.flagged : PostingStatus.active;

    const newPost = await prisma.posting.create({
      data: {
        communityId: parsedData.communityId,
        title: parsedData.title,
        content: parsedData.content,
        imageUrl: parsedData.imageUrl || null,
        pdfUrl: parsedData.pdfUrl || null,
        userId: localUser.id,
        status: postStatus,
      },
      include: {
        user: {
          select: { id: true, clerkUserId: true, name: true, imageUrl: true },
        },
      },
    });

    if (isFlagged) {
      return NextResponse.json(
        {
          message: "Your post has been submitted for review.",
        },
        { status: 202 },
      );
    }
    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    console.error("Error creating post:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
