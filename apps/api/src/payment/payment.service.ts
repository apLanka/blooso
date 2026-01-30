import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { PaymentMethod } from '@prisma/client';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@Injectable()
export class PaymentService {
  private stripe: Stripe | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    if (key) {
      this.stripe = new Stripe(key);
    }
  }

  private async ensureBusinessAccess(businessId: string, user: JwtUser) {
    const business = await this.prisma.business.findFirst({
      where: { id: businessId, ownerId: user.id },
    });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async createCheckoutSession(
    appointmentId: string,
    successUrl: string,
    cancelUrl: string,
    user: JwtUser,
  ) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId },
      include: {
        business: true,
        appointmentServices: { include: { service: true } },
      },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    const hasAccess =
      appointment.business.ownerId === user.id ||
      appointment.guestEmail?.toLowerCase() === user.email?.toLowerCase();
    if (!hasAccess) {
      await this.ensureBusinessAccess(appointment.businessId, user);
    }

    const existing = await this.prisma.payment.findFirst({
      where: { appointmentId, status: 'completed' },
    });
    if (existing) throw new BadRequestException('Appointment already paid');

    if (!this.stripe) throw new BadRequestException('Stripe not configured');

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      appointment.appointmentServices.map((as) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: as.service.name,
            description: `${as.durationMinutes} min`,
          },
          unit_amount: Math.round(as.priceCharged * 100),
        },
        quantity: 1,
      }));

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        appointmentId,
        businessId: appointment.businessId,
      },
    });

    return { url: session.url, sessionId: session.id };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!this.stripe || !secret) {
      throw new BadRequestException('Webhook not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (err) {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const appointmentId = session.metadata?.appointmentId;
      if (!appointmentId) return;

      await this.prisma.$transaction([
        this.prisma.payment.create({
          data: {
            appointmentId,
            amount: (session.amount_total ?? 0) / 100,
            method: 'card',
            status: 'completed',
            stripePaymentId: (session.payment_intent as string) || session.id,
          },
        }),
        this.prisma.appointment.update({
          where: { id: appointmentId },
          data: { status: 'confirmed' },
        }),
      ]);
    }
  }

  async recordInPersonPayment(
    businessId: string,
    appointmentId: string,
    user: JwtUser,
    data: { amount: number; method: PaymentMethod; tipAmount?: number },
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, businessId },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    return this.prisma
      .$transaction([
        this.prisma.payment.create({
          data: {
            appointmentId,
            amount: data.amount,
            method: data.method,
            status: 'completed',
            tipAmount: data.tipAmount ?? 0,
          },
        }),
        this.prisma.appointment.update({
          where: { id: appointmentId },
          data: { status: 'confirmed' },
        }),
      ])
      .then(([payment]) => payment);
  }

  async getPaymentsForAppointment(appointmentId: string, user: JwtUser) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId },
      include: { payments: true },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    await this.ensureBusinessAccess(appointment.businessId, user);
    return appointment.payments;
  }
}
