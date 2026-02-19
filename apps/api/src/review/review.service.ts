import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureBusinessAccess(businessId: string, user: JwtUser) {
    const business = await this.prisma.business.findFirst({
      where: { id: businessId, ownerId: user.id },
    });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async create(dto: CreateReviewDto, user?: JwtUser) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: dto.appointmentId },
      include: { business: true, client: true },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.status !== 'completed') {
      throw new BadRequestException('Can only review completed appointments');
    }

    const existing = await this.prisma.review.findUnique({
      where: { appointmentId: dto.appointmentId },
    });
    if (existing) throw new BadRequestException('Appointment already reviewed');

    const review = await this.prisma.$transaction(async (tx) => {
      const r = await tx.review.create({
        data: {
          businessId: appointment.businessId,
          appointmentId: dto.appointmentId,
          clientId: appointment.clientId,
          rating: dto.rating,
          comment: dto.comment?.trim() || null,
        },
      });

      const agg = await tx.review.aggregate({
        where: { businessId: appointment.businessId },
        _avg: { rating: true },
        _count: true,
      });

      await tx.business.update({
        where: { id: appointment.businessId },
        data: {
          avgRating: agg._avg.rating ?? 0,
          reviewCount: agg._count,
        },
      });

      return r;
    });

    return this.prisma.review.findUnique({
      where: { id: review.id },
      include: {
        appointment: {
          select: {
            guestName: true,
            guestEmail: true,
            client: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async findByBusiness(
    businessId: string,
    query: { page?: number; limit?: number; rating?: number },
  ) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: { businessId: string; rating?: number } = { businessId };
    if (query.rating) where.rating = query.rating;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          appointment: {
            select: {
              guestName: true,
              guestEmail: true,
              client: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    const withClientName = reviews.map((r) => {
      const clientName = r.appointment.client
        ? `${r.appointment.client.firstName} ${r.appointment.client.lastName}`
        : (r.appointment.guestName ?? r.appointment.guestEmail ?? 'Anonymous');
      return {
        ...r,
        clientName,
      };
    });

    return { data: withClientName, total, page, limit };
  }

  async reply(reviewId: string, reply: string, user: JwtUser) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { business: true },
    });
    if (!review) throw new NotFoundException('Review not found');
    await this.ensureBusinessAccess(review.businessId, user);

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { businessReply: reply.trim() },
      include: {
        appointment: {
          select: {
            guestName: true,
            guestEmail: true,
            client: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async findByBusinessForDashboard(businessId: string, user: JwtUser) {
    await this.ensureBusinessAccess(businessId, user);
    return this.findByBusiness(businessId, { limit: 50 });
  }
}
