import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server'; 

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { clerkUserId, email, name, username, imageUrl, ethnicity, phoneNumber, referrer } = await request.json();

    if (!clerkUserId || !email) {
      return NextResponse.json(
        { error: 'clerkUserId and email are required.' },
        { status: 400 }
      );
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

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    );
  }
}
