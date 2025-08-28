import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT update slot
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, date, time } = body;

    if (!name || !date || !time) {
      return NextResponse.json(
        { error: 'Name, date, and time are required' },
        { status: 400 }
      );
    }

    const slot = await prisma.slot.update({
      where: { id },
      data: {
        name,
        date,
        time
      },
      include: {
        event: true,
        topics: true
      }
    });

    return NextResponse.json(slot);
  } catch (error) {
    console.error('Error updating slot:', error);
    return NextResponse.json(
      { error: 'Failed to update slot' },
      { status: 500 }
    );
  }
}

// DELETE slot
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.slot.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting slot:', error);
    return NextResponse.json(
      { error: 'Failed to delete slot' },
      { status: 500 }
    );
  }
} 