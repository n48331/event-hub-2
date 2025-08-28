import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT update topic
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, instructor, maxParticipants, slotId } = body;

    if (!title || !description || !instructor || !slotId) {
      return NextResponse.json(
        { error: 'Title, description, instructor, and slotId are required' },
        { status: 400 }
      );
    }

    const topic = await prisma.topic.update({
      where: { id },
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

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json(
      { error: 'Failed to update topic' },
      { status: 500 }
    );
  }
}

// DELETE topic
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.topic.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json(
      { error: 'Failed to delete topic' },
      { status: 500 }
    );
  }
} 