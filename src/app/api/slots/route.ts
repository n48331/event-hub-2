import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUrl } from '@/lib/urls';

// GET all slots (optionally filtered by event)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    const whereClause = eventId ? { eventId } : {};

    const slots = await prisma.slot.findMany({
      where: whereClause,
      include: {
        event: true,
        topics: {
          include: {
            _count: {
              select: {
                registrations: true
              }
            }
          }
        },
        _count: {
          select: {
            registrations: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Add absolute URLs to slots
    const slotsWithUrls = slots.map(slot => ({
      ...slot,
      apiUrl: getApiUrl(`slots/${slot.id}`),
      event: {
        ...slot.event,
        apiUrl: getApiUrl(`events/${slot.event.id}`)
      },
      topics: slot.topics.map(topic => ({
        ...topic,
        apiUrl: getApiUrl(`topics/${topic.id}`)
      }))
    }));
    
    return NextResponse.json(slotsWithUrls);
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}

// POST create new slot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, date, time, eventId } = body;

    if (!name || !date || !time || !eventId) {
      return NextResponse.json(
        { error: 'Name, date, time, and eventId are required' },
        { status: 400 }
      );
    }

    const slot = await prisma.slot.create({
      data: {
        name,
        date,
        time,
        eventId
      },
      include: {
        event: true,
        topics: true
      }
    });

    // Add absolute URLs to the created slot
    const slotWithUrls = {
      ...slot,
      apiUrl: getApiUrl(`slots/${slot.id}`),
      event: {
        ...slot.event,
        apiUrl: getApiUrl(`events/${slot.event.id}`)
      },
      topics: slot.topics.map(topic => ({
        ...topic,
        apiUrl: getApiUrl(`topics/${topic.id}`)
      }))
    };

    return NextResponse.json(slotWithUrls, { status: 201 });
  } catch (error) {
    console.error('Error creating slot:', error);
    return NextResponse.json(
      { error: 'Failed to create slot' },
      { status: 500 }
    );
  }
} 