import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";

export const checkAdmin = async () => {
  const user = await currentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: user.id },
  });

  if (!dbUser || dbUser.role !== UserRole.admin) {
    throw new Error("Access denied: Not a site admin");
  }

  return dbUser;
};
