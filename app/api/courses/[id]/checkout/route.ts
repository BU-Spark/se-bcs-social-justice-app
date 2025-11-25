/**
 * Checkout Session Creation Endpoint
 * 
 * This endpoint creates a Stripe Checkout Session for course purchases.
 * When a user clicks "Purchase" on a course, this endpoint:
 * 1. Validates the user and course
 * 2. Checks for existing enrollment
 * 3. Creates a Stripe Checkout Session
 * 4. Returns the checkout URL for the user to complete payment
 * 
 * After payment, Stripe redirects to the success_url with the session_id,
 * which is then verified by the verify-payment endpoint.
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
  { params }: { params: { id: string } }
) {
  try {
    // Extract course ID from URL and get authenticated user
    const { id: courseId } = await params;
    const { userId: clerkUserId } = await auth();

    // Authentication check - user must be logged in to purchase
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    // Step 1: Fetch the course from database
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Step 2: Get the user record from database
    // We need the internal user ID (not Clerk ID) for enrollment
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Step 3: Check if user already has enrollment for this course
    // Prevents duplicate purchases and unnecessary checkout sessions
    const existingEnrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Step 4: Prepare redirect URLs
    // Get the origin to construct absolute URLs for Stripe redirects
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Step 5: Create Stripe Checkout Session
    // This creates a payment session that the user will be redirected to
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Only accept card payments
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.name,
              description: course.description || undefined,
            },
            // Stripe requires amounts in cents, so multiply by 100
            unit_amount: Math.round(course.price * 100),
          },
          quantity: 1, // One course per purchase
        },
      ],
      mode: "payment", // One-time payment (not subscription)
      // Success URL: Stripe will append session_id automatically
      // The {CHECKOUT_SESSION_ID} placeholder is replaced by Stripe with the actual session ID
      success_url: `${origin}/coaching/${courseId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/coaching/${courseId}?payment=cancelled`,
      client_reference_id: courseId, // Store course ID for reference
      // Metadata: Store user and course info for verification after payment
      // This is used by the verify-payment endpoint to validate the session
      metadata: {
        userId: user.id, // Internal user ID
        courseId: courseId,
        clerkUserId: clerkUserId, // Clerk user ID for additional verification
      },
    });

    // Return the session ID and checkout URL
    // Frontend will redirect user to session.url to complete payment
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

