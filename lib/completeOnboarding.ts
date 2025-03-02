import prisma from "@/lib/db";

export const completeOnboarding = async (userId: string) => {
  try {
    if (!userId) {
      throw new Error("User ID is required to update onboarding status.");
    }

    const updatedUser = await prisma.user.update({
      where: {
        clerkUserId: userId,
      },
      data: {
        onboardingComplete: true,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Error updating user onboarding status:", error);
    throw error;
  }
};
