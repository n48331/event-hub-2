import { NextRequest, NextResponse } from 'next/server';
import { sendSummaryMail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const { email, name, registrations, isUpdate } = await request.json();
    if (!email || !registrations || !Array.isArray(registrations)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // You can use a public logo URL or serve from /public
    const bannerUrl = `/banner.png`;
    // const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/logo.png`;
    const subject = isUpdate ? 'Your Registration Has Been Updated' : 'Your Registration Confirmation';
    await sendSummaryMail({ to: email, name, registrations, bannerUrl, subject });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending summary email:', error);
    return NextResponse.json({ error: 'Failed to send summary email' }, { status: 500 });
  }
}
