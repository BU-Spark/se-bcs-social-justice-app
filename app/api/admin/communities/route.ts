import { checkAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await checkAdmin();
    const { name, type } = await req.json();

    if (!name || !type) {
      return new NextResponse("Name and type are required", { status: 400 });
    }
    const community = await prisma.community.create({ data: { name, type } });
    return NextResponse.json(community, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return new NextResponse("A community with this name already exists", {
        status: 409,
      });
    }
    if (error.message === "Forbidden: Not an admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
