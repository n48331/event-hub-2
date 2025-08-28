import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getEventUrl, getApiUrl } from '@/lib/urls';

const prisma = new PrismaClient();
// GET /event-hub/api/events/[id] - Get event by ID or UUID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try to find by UUID first, then by ID
    const event = await prisma.event.findFirst({
      where: {
        OR: [
          { uuid: id },
          { id: id }
        ]
      },
      include: {
        slots: {
          include: {
            topics: {
              include: {
                registrations: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    organization: true,
                    createdAt: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Add absolute URLs to the event
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

    return NextResponse.json(eventWithUrls);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT /event-hub/api/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, isActive } = body;

    const event = await prisma.event.update({
      where: { id },
      data: {
        name,
        description,
        isActive
      },
      include: {
        slots: {
          include: {
            topics: true
          }
        }
      }
    });

    // Add absolute URLs to the updated event
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

    return NextResponse.json(eventWithUrls);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /event-hub/api/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.event.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
