import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mailer';
import { getApiUrl } from '@/lib/urls';

// GET all registrations or registrations by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const eventId = searchParams.get('eventId');

    if (email) {
      // Fetch registrations for specific email
      const registrations = await prisma.registration.findMany({
        where: { 
          email,
          ...(eventId && {
            slot: {
              eventId
            }
          })
        },
        include: {
          slot: {
            include: {
              event: true
            }
          },
          topic: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Add absolute URLs to registrations
      const registrationsWithUrls = registrations.map(registration => ({
        ...registration,
        apiUrl: getApiUrl(`registrations/${registration.id}`),
        slot: {
          ...registration.slot,
          apiUrl: getApiUrl(`slots/${registration.slot.id}`)
        },
        topic: {
          ...registration.topic,
          apiUrl: getApiUrl(`topics/${registration.topic.id}`)
        }
      }));
      
      return NextResponse.json(registrationsWithUrls);
    }

    // Fetch all registrations
    const registrations = await prisma.registration.findMany({
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
        topic: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Add absolute URLs to registrations
    const registrationsWithUrls = registrations.map(registration => ({
      ...registration,
      apiUrl: getApiUrl(`registrations/${registration.id}`),
      slot: {
        ...registration.slot,
        apiUrl: getApiUrl(`slots/${registration.slot.id}`)
      },
      topic: {
        ...registration.topic,
        apiUrl: getApiUrl(`topics/${registration.topic.id}`)
      }
    }));
    
    return NextResponse.json(registrationsWithUrls);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

// POST create new registration or update existing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, organization, slotId, topicId, isUpdate = false } = body;

    if (!email || !slotId || !topicId) {
      return NextResponse.json(
        { error: 'Email, slotId, and topicId are required' },
        { status: 400 }
      );
    }

    // Check if topic is full
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        _count: {
          select: {
            registrations: true
          }
        }
      }
    });

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    if (topic._count.registrations >= topic.maxParticipants) {
      return NextResponse.json(
        { error: 'Topic is full' },
        { status: 409 }
      );
    }

    // Check if registration already exists for this email and slot
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        email,
        slotId
      }
    });

    let registration;

    if (existingRegistration) {
      // Update existing registration
      registration = await prisma.registration.update({
        where: { id: existingRegistration.id },
        data: {
          topicId
        },
        include: {
          slot: {
            include: {
              event: true
            }
          },
          topic: true
        }
      });
    } else {
      // Create new registration
      registration = await prisma.registration.create({
        data: {
          email,
          name: name || null,
          organization: organization || null,
          slotId,
          topicId
        },
        include: {
          slot: {
            include: {
              event: true
            }
          },
          topic: true
        }
      });
    }

    // Send confirmation email
    // try {
    //   await sendMail({
    //     to: registration.email,
    //     subject: 'Registration Confirmation',
    //     text: `Dear ${registration.name || 'Participant'},\n\nYou have successfully registered for the event: ${registration.slot.event.name}\nSlot: ${registration.slot.name}\nTopic: ${registration.topic.title}\n\nThank you!`,
    //     html: `<p>Dear ${registration.name || 'Participant'},</p><p>You have successfully registered for the event: <b>${registration.slot.event.name}</b><br/>Slot: <b>${registration.slot.name}</b><br/>Topic: <b>${registration.topic.title}</b></p><p>Thank you!</p>`
    //   });
    // } catch (mailError) {
    //   console.error('Error sending confirmation email:', mailError);
    // }

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating registration:', error);
    return NextResponse.json(
      { error: 'Failed to create/update registration' },
      { status: 500 }
    );
  }
} 