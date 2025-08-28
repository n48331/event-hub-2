import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: "indenxtgenbot@indegene.com",
    pass: "P@Nd-Gne13ind",
  },
});

export async function sendMail({ to, subject, text, html }: { to: string; subject: string; text?: string; html?: string }) {
  const info = await transporter.sendMail({
    from: "indenxtgenbot@indegene.com",
    to,
    subject,
    text,
    html,
  });
  return info;
}

export async function sendSummaryMail({ to, name, registrations, bannerUrl, subject }: {
  to: string;
  name?: string;
  registrations: Array<{ event: string; slot: string; topic: string; date?: string; time?: string }>;
  bannerUrl: string;
  subject?: string;
}) {
  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden; background: #f4f6fb;">
  <!-- Banner Image as Header -->
  <div style="width: 100%; ">
    <img src="https://raw.githubusercontent.com/n48331/event-hub-2/refs/heads/main/public/banner.png" alt="Event Banner" style="width: 100%; display: block; object-fit: cover;"/>
  </div>
  <!-- Main Content -->
  <div style="padding: 32px 24px 24px 24px; background: #fff;">
    <h2 style="color: #2563eb; margin: 0 0 16px 0; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 0.5px;">
      Registration Confirmed!
    </h2>
    <p style="font-size: 16px; color: #222; margin-bottom: 18px;">
      Dear <b>${name || 'Participant'}</b>,
    </p>
    <p style="font-size: 16px; color: #222; margin-bottom: 18px;">
      Thank you for registering for our event. We are excited to have you join us! Below are your confirmed topics and schedule:
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0 16px 0; background: #f9f9f9;">
      <thead>
        <tr style="background: #e0e7ff;">
          <th style="padding: 10px; border: 1px solid #ddd; font-size: 15px; text-align: left;">Event</th>
          <th style="padding: 10px; border: 1px solid #ddd; font-size: 15px; text-align: left;">Date</th>
          <th style="padding: 10px; border: 1px solid #ddd; font-size: 15px; text-align: left;">Time</th>
          <th style="padding: 10px; border: 1px solid #ddd; font-size: 15px; text-align: left;">Topic</th>
        </tr>
      </thead>
      <tbody>
        ${registrations.map(r => `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #fff;">${r.event}</td>
            <td style="padding: 10px; border: 1px solid #ddd; background: #fff;">${r.date || 'TBD'}</td>
            <td style="padding: 10px; border: 1px solid #ddd; background: #fff;">${r.time || 'TBD'}</td>
            <td style="padding: 10px; border: 1px solid #ddd; background: #fff;">${r.topic}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <p style="font-size: 16px; color: #222; margin-top: 28px; margin-bottom: 0;">
      If you have any questions, please contact us at <a href="mailto:milan.berstling@boehringer-ingelheim.com" style="color: #2563eb; text-decoration: underline;">milan.berstling@boehringer-ingelheim.com</a>.
    </p>
    <p style="font-size: 16px; color: #222; margin-top: 18px; margin-bottom: 0;">
      We look forward to seeing you at the event!
    </p>
    <p style="font-size: 14px; color: #555; margin-top: 24px; margin-bottom: 0;">
      This project is co-organized by Boehringer Ingelheim RCV GmbH &amp; Co KG and the Institute of Heart Diseases, University Hospital, Wroclaw, Poland.
    </p>
    
  </div>
  <!-- Footer -->
  <div style="background: #2563eb; color: #fff; text-align: center; padding: 14px 0; font-size: 13px; letter-spacing: 0.2px;">
    &copy; ${new Date().getFullYear()} Indegene. All rights reserved.
  </div>
</div>
  `;
  await sendMail({ to, subject: subject || 'Your Registration Confirmation', html });
}
