import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid email', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    const subscriber = await prisma.waitlist.create({
      data: {
        email,
        joinedAt: new Date(),
      },
    });

    return NextResponse.json(
      { success: true, message: 'Successfully joined waitlist' },
      { status: 201 }
    );
  } catch (error) {
    // Handle unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Email already registered', code: 'DUPLICATE_EMAIL' },
        { status: 409 }
      );
    }

    console.error('Waitlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to join waitlist', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}