import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { username, ethnicity, phoneNumber, referrer, interests } =
      await req.json();

    // Update the user details in Prisma
    const updatedUser = await prisma.user.update({
      where: { clerkUserId: user.id },
      data: {
        username,
        ethnicity,
        phoneNumber,
        referrer,
      },
    });

    // Process interests separately (many-to-many relationship)
    if (interests.length > 0) {
      const existingInterests = await prisma.interest.findMany({
        where: { name: { in: interests } },
      });

      const newInterests = interests
        .filter(
          (i: string) =>
            !existingInterests.map((e: { name: unknown }) => e.name).includes(i)
        )
        .map((name: string) => ({ name }));

      if (newInterests.length > 0) {
        await prisma.interest.createMany({ data: newInterests });
      }

      const allInterests = await prisma.interest.findMany({
        where: { name: { in: interests } },
      });

      await prisma.userInterest.deleteMany({
        where: { userId: updatedUser.id },
      });

      await prisma.userInterest.createMany({
        data: allInterests.map((i) => ({
          userId: updatedUser.id,
          interestId: i.id,
        })),
      });
    }

    return NextResponse.json(
      { message: "User updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
