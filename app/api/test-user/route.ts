// app/api/test-user/route.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { clerkUserId, email, name, username, imageUrl, ethnicity, phoneNumber, referrer } = await request.json();

    if (!clerkUserId || !email) {
      return new Response(JSON.stringify({ error: 'clerkUserId and email are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newUser = await prisma.user.create({
      data: {
        clerkUserId,
        email,
        name: name || null,
        username: username || null,
        imageUrl: imageUrl || null,
        ethnicity: ethnicity || null,
        phoneNumber: phoneNumber || null,
        referrer: referrer || [],
      },
    });

    return new Response(JSON.stringify(newUser), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(JSON.stringify({ error: 'Error creating user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
