import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET - Fetch single course (admin only)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
      where: { id },
      include: {
        modules: {
          orderBy: { moduleNumber: "asc" },
          include: {
            contents: true,
          },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
      where: { id },
      data: {
        name,
        description,
        price,
        isStandalone,
      },
    });

    // Get existing modules
    const existingModules = await prisma.module.findMany({
      where: { courseId: id },
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
        
        // Delete existing contents for this module
        await prisma.moduleContent.deleteMany({
          where: { moduleId: module.id },
        });
        
        // Create new contents if provided
        if (module.contents && module.contents.length > 0) {
          await prisma.moduleContent.createMany({
            data: module.contents.map((content: any) => ({
              moduleId: module.id,
              contentType: content.type,
              title: content.name,
              externalLink: content.externalLink,
              isExternal: true,
            })),
          });
        }
      } else {
        // Create new module with contents
        await prisma.module.create({
          data: {
            title: module.title,
            moduleNumber: module.moduleNumber,
            description: module.description,
            courseId: id,
            contents: module.contents && module.contents.length > 0 ? {
              create: module.contents.map((content: any) => ({
                contentType: content.type,
                title: content.name,
                externalLink: content.externalLink,
                isExternal: true,
              })),
            } : undefined,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
      where: { id },
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