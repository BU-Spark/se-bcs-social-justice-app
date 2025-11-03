import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

interface ModuleData {
  title: string;
  moduleNumber: number;
  description: string | null;
}

interface CourseData {
  name: string;
  description: string | null;
  price: number;
  isStandalone: boolean;
  modules: ModuleData[];
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = (await request.json()) as CourseData;
    const { name, description, price, isStandalone, modules } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Course name is required" },
        { status: 400 }
      );
    }

    if (price === undefined || price === null || price < 0) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );
    }

    // Create course with modules
    const course = await prisma.course.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: Number(price),
        isStandalone: Boolean(isStandalone),
        modules: {
          create: modules.map((module) => ({
            title: module.title.trim(),
            moduleNumber: module.moduleNumber,
            description: module.description?.trim() || null,
          })),
        },
      },
      include: {
        modules: {
          orderBy: {
            moduleNumber: "asc",
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Course created successfully",
        course,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve all courses (optional, for admin listing)
export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const courses = await prisma.course.findMany({
      include: {
        modules: {
          orderBy: {
            moduleNumber: "asc",
          },
        },
        enrollments: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}