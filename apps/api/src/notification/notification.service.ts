import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface BookingConfirmationData {
  to: string;
  guestName: string;
  businessName: string;
  serviceNames: string;
  startTime: string;
  endTime: string;
  locationAddress?: string;
  totalPrice: number;
}

export interface CancellationData {
  to: string;
  guestName: string;
  businessName: string;
  serviceNames: string;
  originalStartTime: string;
  reason?: string;
}

@Injectable()
export class NotificationService {
  private resend: Resend | null = null;
  private from: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
    this.from = this.config.get<string>('EMAIL_FROM') ?? 'noreply@example.com';
  }

  private async sendEmail(to: string, subject: string, html: string) {
    if (!this.resend) {
      console.log(
        '[Notification] Email skipped (Resend not configured):',
        subject,
        'to',
        to,
      );
      return;
    }
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
      });
    } catch (err) {
      console.error('[Notification] Email send failed:', err);
    }
  }

  async sendBookingConfirmation(data: BookingConfirmationData) {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333}h1{color:#111}.card{background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0}.footer{color:#6b7280;font-size:12px;margin-top:24px}</style></head>
<body>
  <h1>Booking confirmed</h1>
  <p>Hi ${data.guestName || 'there'},</p>
  <p>Your appointment at <strong>${data.businessName}</strong> is confirmed.</p>
  <div class="card">
    <p><strong>Services:</strong> ${data.serviceNames}</p>
    <p><strong>Date & time:</strong> ${data.startTime} – ${data.endTime}</p>
    ${data.locationAddress ? `<p><strong>Location:</strong> ${data.locationAddress}</p>` : ''}
    <p><strong>Total:</strong> $${data.totalPrice.toFixed(2)}</p>
  </div>
  <p>We look forward to seeing you!</p>
  <div class="footer">${data.businessName}</div>
</body>
</html>`;
    await this.sendEmail(
      data.to,
      `Booking confirmed at ${data.businessName}`,
      html,
    );
  }

  async sendCancellationNotice(data: CancellationData) {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333}h1{color:#111}.card{background:#fef2f2;border-radius:8px;padding:16px;margin:16px 0}.footer{color:#6b7280;font-size:12px;margin-top:24px}</style></head>
<body>
  <h1>Appointment cancelled</h1>
  <p>Hi ${data.guestName || 'there'},</p>
  <p>Your appointment at <strong>${data.businessName}</strong> has been cancelled.</p>
  <div class="card">
    <p><strong>Services:</strong> ${data.serviceNames}</p>
    <p><strong>Was scheduled for:</strong> ${data.originalStartTime}</p>
    ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
  </div>
  <p>Would you like to book again? Visit our booking page to schedule a new appointment.</p>
  <div class="footer">${data.businessName}</div>
</body>
</html>`;
    await this.sendEmail(
      data.to,
      `Appointment cancelled – ${data.businessName}`,
      html,
    );
  }
}
