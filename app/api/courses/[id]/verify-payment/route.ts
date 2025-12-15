/**
 * Payment Verification Endpoint
 *
 * This endpoint verifies a Stripe checkout session after payment completion
 * and creates the course enrollment. This is called when the user is redirected
 * back from Stripe Checkout with a success status.
 *
 * Flow:
 * 1. User completes payment on Stripe Checkout
 * 2. Stripe redirects to success URL with session_id
 * 3. Frontend calls this endpoint to verify payment
 * 4. We retrieve the session from Stripe and verify payment status
 * 5. If valid, create the UserCourse enrollment record
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Extract course ID from URL params and session ID from request body
    const { id: courseId } = await params;
    const { userId: clerkUserId } = await auth();
    const { sessionId } = await req.json();

    // Authentication check - user must be logged in
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate that session ID was provided
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Verify Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 },
      );
    }

    // Step 1: Retrieve the checkout session from Stripe
    // This fetches the session details including payment status
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Step 2: Verify payment was actually completed
    // Only proceed if payment_status is "paid"
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 },
      );
    }

    // Step 3: Validate session metadata matches the course
    // The metadata was set when creating the checkout session
    const { userId, courseId: sessionCourseId } = session.metadata || {};

    if (!userId || !sessionCourseId) {
      return NextResponse.json(
        { error: "Invalid session metadata" },
        { status: 400 },
      );
    }

    // Ensure the session is for the correct course
    if (sessionCourseId !== courseId) {
      return NextResponse.json(
        { error: "Session does not match course" },
        { status: 400 },
      );
    }

    // Step 4: Verify the authenticated user matches the session user
    // This prevents users from using someone else's payment session
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "User mismatch" }, { status: 403 });
    }

    // Step 5: Check for existing enrollment to prevent duplicates
    // This handles cases where the user refreshes the page or the endpoint is called multiple times
    const existingEnrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      // Already enrolled - return success (idempotent operation)
      // This is safe because the user has already paid and been enrolled
      return NextResponse.json({
        success: true,
        message: "Already enrolled",
      });
    }

    // Step 6: Create the enrollment record
    // This grants the user permanent access to the course
    // Note: We don't set trialExpiresAt, which indicates this is a permanent purchase
    // (as opposed to a trial enrollment which would have an expiration date)
    await prisma.userCourse.create({
      data: {
        userId: user.id,
        courseId: courseId,
        completionStatus: "not_started", // User hasn't started the course yet
        // trialExpiresAt is intentionally null - indicates permanent purchase
      },
    });

    return NextResponse.json({
      success: true,
      message: "Enrollment created successfully",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 },
    );
  }
}
