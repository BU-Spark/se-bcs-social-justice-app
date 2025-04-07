import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete existing appointment types
  await prisma.appointmentType.deleteMany({});

  // Create sample appointment types
  const appointmentTypes = [
    {
      typeName: "One-on-One Consultation",
      description:
        "Schedule a private session with a mentor or coach for personalized guidance and support.",
      icon: "👤",
    },
    {
      typeName: "Group Consultation",
      description:
        "Join a group session to learn and grow together with others in your community.",
      icon: "👥",
    },
    {
      typeName: "Career Guidance",
      description:
        "Get expert advice on career development, resume review, and job search strategies.",
      icon: "💼",
    },
    {
      typeName: "Mental Health Support",
      description:
        "Connect with mental health professionals for counseling and emotional support.",
      icon: "🫂",
    },
    {
      typeName: "Educational Workshop",
      description:
        "Participate in interactive workshops focused on skill development and learning.",
      icon: "📚",
    },
    {
      typeName: "Community Discussion",
      description:
        "Engage in meaningful discussions about social justice issues affecting our community.",
      icon: "🗣️",
    },
  ];

  for (const type of appointmentTypes) {
    await prisma.appointmentType.create({
      data: type,
    });
  }

  console.log("Sample appointment types have been created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
