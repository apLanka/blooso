import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AvailabilityService } from '../availability/availability.service';
import { NotificationService } from '../notification/notification.service';
import { ClientService } from '../client/client.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { BookingSource } from '@prisma/client';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilityService: AvailabilityService,
    private readonly notificationService: NotificationService,
    private readonly clientService: ClientService,
  ) {}

  private async ensureBusinessAccess(businessId: string, user: JwtUser) {
    const business = await this.prisma.business.findFirst({
      where: { id: businessId, ownerId: user.id },
    });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async createBooking(dto: CreateBookingDto, user?: JwtUser) {
    const business = await this.prisma.business.findUnique({
      where: { id: dto.businessId },
      include: { locations: true },
    });
    if (!business) throw new NotFoundException('Business not found');

    if (user) {
      await this.ensureBusinessAccess(dto.businessId, user);
    }

    const location = business.locations.find((l) => l.id === dto.locationId);
    if (!location) throw new NotFoundException('Location not found');

    const staff = await this.prisma.staffMember.findFirst({
      where: { id: dto.staffId, businessId: dto.businessId, isActive: true },
    });
    if (!staff) throw new NotFoundException('Staff not found');

    const services = await this.prisma.service.findMany({
      where: {
        id: { in: dto.serviceIds },
        businessId: dto.businessId,
        isActive: true,
      },
    });
    if (services.length !== dto.serviceIds.length) {
      throw new NotFoundException('One or more services not found');
    }

    const staffServices = await this.prisma.staffService.findMany({
      where: {
        staffId: dto.staffId,
        serviceId: { in: dto.serviceIds },
      },
    });
    if (staffServices.length !== dto.serviceIds.length) {
      throw new ConflictException('Staff cannot perform one or more services');
    }

    const startTime = new Date(dto.startTime);
    if (isNaN(startTime.getTime())) {
      throw new ConflictException('Invalid start time');
    }

    const totalDuration = services.reduce(
      (acc, s) =>
        acc + s.bufferBeforeMinutes + s.durationMinutes + s.bufferAfterMinutes,
      0,
    );
    const endTime = new Date(startTime.getTime() + totalDuration * 60 * 1000);
    const totalPrice = services.reduce((acc, s) => acc + s.price, 0);

    let clientId = dto.clientId ?? null;
    if (!clientId && dto.guestEmail) {
      clientId = await this.clientService.findOrCreateByEmail(
        dto.businessId,
        {
          email: dto.guestEmail,
          guestName: dto.guestName,
          phone: dto.guestPhone,
        },
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const conflicting = await tx.appointment.findFirst({
        where: {
          staffId: dto.staffId,
          status: { notIn: ['cancelled', 'no_show'] },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });
      if (conflicting) {
        throw new ConflictException('Time slot is no longer available');
      }

      const appointment = await tx.appointment.create({
        data: {
          businessId: dto.businessId,
          locationId: dto.locationId,
          staffId: dto.staffId,
          clientId,
          guestName: dto.guestName ?? null,
          guestEmail: dto.guestEmail ?? null,
          guestPhone: dto.guestPhone ?? null,
          startTime,
          endTime,
          status: 'pending',
          source: (dto.source as BookingSource) ?? 'walk_in',
          totalPrice,
          notes: dto.notes ?? null,
        },
      });

      await tx.appointmentService.createMany({
        data: services.map((s, i) => ({
          appointmentId: appointment.id,
          serviceId: s.id,
          staffId: dto.staffId,
          priceCharged: s.price,
          durationMinutes: s.durationMinutes,
          sortOrder: i,
        })),
      });

      return tx.appointment.findUnique({
        where: { id: appointment.id },
        include: {
          staff: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
          appointmentServices: {
            include: { service: { select: { name: true } } },
          },
          location: true,
          business: true,
        },
      });
    });
    const apt = result;
    if (apt?.guestEmail) {
      this.notificationService
        .sendBookingConfirmation({
          to: apt.guestEmail,
          guestName: apt.guestName ?? 'Guest',
          businessName: apt.business.name,
          serviceNames: apt.appointmentServices
            .map((as) => as.service?.name)
            .filter(Boolean)
            .join(', '),
          startTime: apt.startTime.toISOString(),
          endTime: apt.endTime.toISOString(),
          locationAddress: apt.location?.address,
          totalPrice: apt.totalPrice,
        })
        .catch(() => {});
    }
    return apt;
  }

  async findAppointments(
    businessId: string,
    user: JwtUser,
    query: { date?: string; staffId?: string; status?: string },
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const where: Record<string, unknown> = { businessId };
    if (query.date) {
      const d = new Date(query.date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.startTime = { gte: d, lt: next };
    }
    if (query.staffId) where.staffId = query.staffId;
    if (query.status) where.status = query.status;

    return this.prisma.appointment.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        staff: {
          include: { user: { select: { name: true, email: true } } },
        },
        appointmentServices: {
          include: {
            service: { select: { name: true, durationMinutes: true } },
          },
        },
      },
    });
  }

  async findOneAppointment(
    businessId: string,
    appointmentId: string,
    user: JwtUser,
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const apt = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, businessId },
      include: {
        staff: {
          include: { user: { select: { name: true, email: true } } },
        },
        appointmentServices: {
          include: {
            service: { select: { name: true, durationMinutes: true } },
          },
        },
      },
    });
    if (!apt) throw new NotFoundException('Appointment not found');
    return apt;
  }

  async updateAppointment(
    businessId: string,
    appointmentId: string,
    user: JwtUser,
    dto: UpdateAppointmentDto,
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const apt = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, businessId },
    });
    if (!apt) throw new NotFoundException('Appointment not found');

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.startTime !== undefined && {
          startTime: new Date(dto.startTime),
        }),
        ...(dto.endTime !== undefined && { endTime: new Date(dto.endTime) }),
      },
      include: {
        staff: {
          include: { user: { select: { name: true, email: true } } },
        },
        appointmentServices: {
          include: { service: { select: { name: true } } },
        },
      },
    });
  }

  async cancelAppointment(
    businessId: string,
    appointmentId: string,
    user: JwtUser,
    reason?: string,
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const apt = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, businessId },
      include: {
        business: true,
        appointmentServices: { include: { service: true } },
      },
    });
    if (!apt) throw new NotFoundException('Appointment not found');

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'cancelled',
        cancellationReason: reason ?? null,
      },
      include: {
        staff: {
          include: { user: { select: { name: true, email: true } } },
        },
        appointmentServices: {
          include: { service: { select: { name: true } } },
        },
      },
    });

    if (apt.guestEmail) {
      this.notificationService
        .sendCancellationNotice({
          to: apt.guestEmail,
          guestName: apt.guestName ?? 'Guest',
          businessName: apt.business.name,
          serviceNames: apt.appointmentServices
            .map((as) => as.service?.name)
            .filter(Boolean)
            .join(', '),
          originalStartTime: apt.startTime.toISOString(),
          reason: reason ?? undefined,
        })
        .catch(() => {});
    }
    return updated;
  }
}
