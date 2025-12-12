import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

// Disable body parsing, we need the raw body for webhook signature verification
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 },
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const { userId, courseId } = session.metadata || {};

      if (!userId || !courseId) {
        console.error("Missing metadata in session:", session.id);
        return NextResponse.json(
          { error: "Missing required metadata" },
          { status: 400 },
        );
      }

      // Check if enrollment already exists (prevent duplicates)
      const existingEnrollment = await prisma.userCourse.findUnique({
        where: {
          userId_courseId: {
            userId: userId,
            courseId: courseId,
          },
        },
      });

      if (existingEnrollment) {
        console.log(
          "Enrollment already exists for user:",
          userId,
          "course:",
          courseId,
        );
        return NextResponse.json({ received: true });
      }

      // Create enrollment without trial expiration (permanent purchase)
      await prisma.userCourse.create({
        data: {
          userId: userId,
          courseId: courseId,
          completionStatus: "not_started",
          // Don't set trialExpiresAt - this indicates a permanent purchase
        },
      });

      console.log("Course enrollment created successfully:", {
        userId,
        courseId,
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return NextResponse.json(
        { error: "Error processing webhook" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
