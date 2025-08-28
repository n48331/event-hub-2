import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUrl } from '@/lib/urls';

// GET all topics (optionally filtered by event)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    const topics = await prisma.topic.findMany({
      where: eventId ? {
        slot: {
          eventId
        }
      } : {},
      include: {
        slot: {
          include: {
            event: true
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
    
    // Add absolute URLs to topics
    const topicsWithUrls = topics.map(topic => ({
      ...topic,
      apiUrl: getApiUrl(`topics/${topic.id}`),
      slot: {
        ...topic.slot,
        apiUrl: getApiUrl(`slots/${topic.slot.id}`),
        event: {
          ...topic.slot.event,
          apiUrl: getApiUrl(`events/${topic.slot.event.id}`)
        }
      }
    }));
    
    return NextResponse.json(topicsWithUrls);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}

// POST create new topic
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, instructor, maxParticipants, slotId } = body;

    if (!title || !description || !instructor || !slotId) {
      return NextResponse.json(
        { error: 'Title, description, instructor, and slotId are required' },
        { status: 400 }
      );
    }

    const topic = await prisma.topic.create({
      data: {
        title,
        description,
        instructor,
        maxParticipants: maxParticipants || 15,
        slotId
      },
      include: {
        slot: {
          include: {
            event: true
          }
        }
      }
    });

    // Add absolute URLs to the created topic
    const topicWithUrls = {
      ...topic,
      apiUrl: getApiUrl(`topics/${topic.id}`),
      slot: {
        ...topic.slot,
        apiUrl: getApiUrl(`slots/${topic.slot.id}`),
        event: {
          ...topic.slot.event,
          apiUrl: getApiUrl(`events/${topic.slot.event.id}`)
        }
      }
    };

    return NextResponse.json(topicWithUrls, { status: 201 });
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    );
  }
} 