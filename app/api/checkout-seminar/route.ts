import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { seminarId, title, price } = body;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

    const successUrl = `${baseUrl}/coaching/seminars/${seminarId}?paidSeminar=${seminarId}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/coaching/seminars/${seminarId}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(price * 100),
            product_data: { name: title },
          },
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
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
