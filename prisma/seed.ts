import { PrismaClient, AppointmentAccessType } from "@prisma/client";
import { communities } from "../db/mock-data.ts";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Clean up existing data to avoid conflicts
  // Delete in an order that respects foreign key constraints
  console.log("Deleting old data...");
  await prisma.tierCourseAccess.deleteMany();
  await prisma.userMembership.deleteMany();
  await prisma.coursePrerequisite.deleteMany();
  await prisma.userCourse.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.membershipTier.deleteMany();
  await prisma.appointmentType.deleteMany();
  await prisma.interest.deleteMany();

  // 2. Create interests
  console.log("Creating interests...");
  const interests = [
    "Community",
    "Chat",
    "Coaching",
    "Events",
    "Courses",
    "Social Justice",
    "Environmental Justice",
    "Racial Justice",
    "Identity",
    "Culture",
    "Diversity",
    "Respect",
    "Gender",
    "Addinity Groups",
    "Transformational Soul Coaching",
    "Research",
    "Social Justice Hub",
    "Partnerships",
    "Healthcare Justice",
    "Structural Inequality",
    "Academica",
    "K-12 Education",
    "Corporate",
    "Nonprofit Organizations",
    "Grassriits Organizations",
  ];

  for (const interestName of interests) {
    await prisma.interest.create({
      data: { name: interestName },
    });
  }

  console.log("Sample interests have been created");

  // 3. Create appointment types
  console.log("Creating appointment types...");
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

  // 4. Create Membership Tiers
  console.log("Creating membership tiers...");
  const starterTier = await prisma.membershipTier.create({
    data: {
      tierName: "The Starter Messenger",
      monthlyPrice: 0,
      annualPrice: 0,
      description:
        "Public-facing email list and private, entry-level community forum access.",
    },
  });

  const actionTier = await prisma.membershipTier.create({
    data: {
      tierName: "The Action Messenger",
      monthlyPrice: 19,
      annualPrice: 197,
      description:
        "Includes private forum, monthly Q&A, and exclusive monthly resources.",
    },
  });

  const multiplierTier = await prisma.membershipTier.create({
    data: {
      tierName: "The Multiplier Messenger",
      monthlyPrice: 97,
      annualPrice: 1067,
      description:
        "All Tier 2 benefits plus bi-weekly masterclasses, hot seat coaching, and the first core pillar course.",
    },
  });

  // 5. Create Courses and Modules
  console.log("Creating courses and modules...");
  const entryCourse = await prisma.course.create({
    data: {
      name: "Courageous Hearts Companion: The 7-Day Messenger Launch",
      price: 57.0,
      isStandalone: true,
      modules: {
        create: [
          { title: "The 7-Minute Journal: Beyond the Prompt." },
          { title: "BTM Pillar Preview: Finding Your Core Courage." },
          {
            title:
              "Practical Practice: How to Have a Hard Conversation This Week.",
          },
          { title: "Your First Messenger Move." },
        ],
      },
    },
  });

  const course1 = await prisma.course.create({
    data: {
      name: "Mastering Identity: From Survival to the Self-Conscious Messenger",
      price: 297.0,
      isStandalone: true,
      description:
        "Healing core wounds and deconstructing limiting beliefs to claim authentic personal power.",
      modules: {
        create: [
          {
            title:
              "The Criminology of Self: How Systems Shape Your Self-Worth.",
          },
          { title: "Healing Internal Injustice." },
          { title: "Boundary Setting as a Radical Act of Self-Respect." },
        ],
      },
    },
  });

  const course2 = await prisma.course.create({
    data: {
      name: "Decoding Culture: Systems, Power, and the Path to Equity",
      price: 297.0,
      isStandalone: true,
      description:
        "Moving from internal work to analyzing and influencing external environments.",
      modules: {
        create: [
          {
            title:
              "Organizational Culture Audit: Spotting the Micro-Injustices.",
          },
          { title: "The Restorative Lens: Shifting from Blame to Repair." },
          {
            title:
              "Systems Thinking for the Soul: Moving Beyond Individual Guilt.",
          },
        ],
      },
    },
  });

  const course3 = await prisma.course.create({
    data: {
      name: "The Diversity & Difference Dividend: Harnessing Intersectionality for Impact",
      price: 297.0,
      isStandalone: true,
      description:
        "Practical, high-level training on embracing difference and moving past fear.",
      modules: {
        create: [
          { title: "The Empathy Gap: Bridging the Divide." },
          { title: "Intent vs. Impact: A Communication Toolkit." },
          { title: "Navigating Conflict as an Opportunity for Growth." },
        ],
      },
    },
  });

  const course4 = await prisma.course.create({
    data: {
      name: "Respect & Reciprocity: The Ethics of Advocacy and Leadership",
      price: 297.0,
      isStandalone: true,
      description:
        "Practical communication and implementation for advocacy and leadership.",
      modules: {
        create: [
          {
            title:
              "The Respect Toolkit: Non-Violent Communication (NVC) for Advocates.",
          },
          { title: "Leading with Integrity: Accountability and Forgiveness." },
          {
            title:
              "Preventing Burnout: Sustainable Boundaries for the Messenger.",
          },
        ],
      },
    },
  });

  const cohortCourse = await prisma.course.create({
    data: {
      name: "52-Week Annual Cohort",
      price: 997.0,
      isStandalone: false,
      description: "52 Structured Group Sessions per year focused on the book.",
    },
  });

  const certCourse = await prisma.course.create({
    data: {
      name: "Be The Messenger Certified Practitioner (BTMC)",
      price: 4997.0,
      isStandalone: false,
      description: "Certification & Professional Development program.",
    },
  });

  // 6. Set up Relationships
  console.log("Setting up relationships...");
  console.log("Creating sample communities...");
  for (const c of communities) {
    await prisma.community.create({
      data: {
        name: c.name,
        description: c.description,
        imageUrl: c.imageUrl,
        type: c.type,
      },
    });
  }
  console.log("✅ Communities created successfully");

  // The Multiplier Messenger tier includes the 'Mastering Identity' course
  await prisma.tierCourseAccess.create({
    data: {
      tierId: multiplierTier.id,
      courseId: course1.id,
    },
  });

  // The BTMC certification requires all 4 core pillar courses
  await prisma.coursePrerequisite.createMany({
    data: [
      { courseId: certCourse.id, requiredCourseId: course1.id },
      { courseId: certCourse.id, requiredCourseId: course2.id },
      { courseId: certCourse.id, requiredCourseId: course3.id },
      { courseId: certCourse.id, requiredCourseId: course4.id },
    ],
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
