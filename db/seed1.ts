import { AppointmentAccessType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete existing appointment types
  await prisma.appointmentType.deleteMany();

  // Create sample appointment types
  const appointmentTypes = [
    {
      title: "One-on-One Consultation",
      description:
        "Personalized coaching session for individual support and guidance",
      icon: "Person",
      accessType: AppointmentAccessType.private,
    },
    {
      title: "Group Consultation",
      description:
        "Group coaching session for collaborative learning and support",
      icon: "Groups",
      accessType: AppointmentAccessType.private,
    },
    {
      title: "Mental Health Support",
      description: "Therapeutic session for mental health and well-being",
      icon: "Psychology",
      accessType: AppointmentAccessType.private,
    },
    {
      title: "Legal Consultation",
      description: "Legal advice and support session",
      icon: "Gavel",
      accessType: AppointmentAccessType.private,
    },
    {
      title: "Events",
      description: "Organize public events for larger audiences",
      icon: "Gavel",
      accessType: AppointmentAccessType.public,
    },
    {
      title: "Seminars",
      description: "Seminars for educational information",
      icon: "Gavel",
      accessType: AppointmentAccessType.public,
    },
  ];

  for (const type of appointmentTypes) {
    await prisma.appointmentType.create({
      data: {
        title: type.title,
        description: type.description,
        icon: type.icon,
        accessType: type.accessType as AppointmentAccessType,
      },
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
