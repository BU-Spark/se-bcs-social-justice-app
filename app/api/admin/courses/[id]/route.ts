import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET - Fetch single course (admin only)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        modules: {
          orderBy: { moduleNumber: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

// PUT - Update course and modules (admin only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { name, description, price, isStandalone, modules } = await request.json();

    // Update course
    await prisma.course.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        isStandalone,
      },
    });

    // Get existing modules
    const existingModules = await prisma.module.findMany({
      where: { courseId: params.id },
    });

    const existingModuleIds = existingModules.map((m) => m.id);
    const incomingModuleIds = modules
      .filter((m: any) => m.id)
      .map((m: any) => m.id);

    // Delete modules that are no longer in the list
    const modulesToDelete = existingModuleIds.filter(
      (id) => !incomingModuleIds.includes(id)
    );

    if (modulesToDelete.length > 0) {
      await prisma.module.deleteMany({
        where: { id: { in: modulesToDelete } },
      });
    }

    // Update existing modules and create new ones
    for (const module of modules) {
      if (module.id && existingModuleIds.includes(module.id)) {
        // Update existing module
        await prisma.module.update({
          where: { id: module.id },
          data: {
            title: module.title,
            moduleNumber: module.moduleNumber,
            description: module.description,
          },
        });
      } else {
        // Create new module
        await prisma.module.create({
          data: {
            title: module.title,
            moduleNumber: module.moduleNumber,
            description: module.description,
            courseId: params.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE - Delete course (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    await prisma.course.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}