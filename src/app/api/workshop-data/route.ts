import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET workshop data for registration form
export async function GET() {
  try {
    const slots = await prisma.slot.findMany({
      include: {
        topics: {
          include: {
            _count: {
              select: {
                registrations: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching workshop data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workshop data' },
      { status: 500 }
    );
  }
} 