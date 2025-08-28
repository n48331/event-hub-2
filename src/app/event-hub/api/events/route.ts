import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getEventUrl, getApiUrl } from '@/lib/urls';

const prisma = new PrismaClient();

// GET /event-hub/api/events - Get all events
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        slots: {
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
          }
        }
      }
    });
    
    // Add absolute URLs to each event
    const eventsWithUrls = events.map(event => ({
      ...event,
      url: getEventUrl(event.id),
      apiUrl: getApiUrl(`events/${event.id}`),
      slots: event.slots.map(slot => ({
        ...slot,
        apiUrl: getApiUrl(`slots/${slot.id}`),
        topics: slot.topics.map(topic => ({
          ...topic,
          apiUrl: getApiUrl(`topics/${topic.id}`)
        }))
      }))
    }));
    
    return NextResponse.json(eventsWithUrls);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /event-hub/api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        name,
        description: description || null,
      },
      include: {
        slots: {
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
          }
        }
      }
    });

    // Add absolute URLs to the created event
    const eventWithUrls = {
      ...event,
      url: getEventUrl(event.id),
      apiUrl: getApiUrl(`events/${event.id}`),
      slots: event.slots.map(slot => ({
        ...slot,
        apiUrl: getApiUrl(`slots/${slot.id}`),
        topics: slot.topics.map(topic => ({
          ...topic,
          apiUrl: getApiUrl(`topics/${topic.id}`)
        }))
      }))
    };

    return NextResponse.json(eventWithUrls, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
