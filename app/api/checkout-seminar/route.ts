import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 },
      );
    }

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { seminarId } = await req.json();
    if (!seminarId) {
      return NextResponse.json(
        { error: "Seminar ID is required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId },
      include: { accessRules: true },
    });

    if (!seminar) {
      return NextResponse.json(
        { error: "Seminar not found" },
        { status: 404 },
      );
    }

    const paidRule = seminar.accessRules.find(
      (rule) => rule.price && rule.price > 0,
    );

    if (!paidRule || !paidRule.price) {
      return NextResponse.json(
        { error: "Paid access rule not configured for this seminar" },
        { status: 400 },
      );
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000";

    const successUrl = `${origin}/coaching/seminars/${seminarId}?paidSeminar=${seminarId}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/coaching/seminars/${seminarId}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(paidRule.price * 100),
            product_data: { name: seminar.title },
          },
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: seminarId,
      metadata: {
        type: "seminar",
        seminarId,
        userId: user.id,
        clerkUserId,
        userEmail: user.email,
        userName: user.name || "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Error creating Stripe Checkout Session:", err);
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 },
    );
  }
}
