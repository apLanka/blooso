import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  staffId: string;
}

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get available time slots for a service on a given date.
   * If staffId is provided, only that staff's slots. Otherwise all staff who can do the service.
   */
  async getAvailableSlots(
    businessId: string,
    serviceId: string,
    dateStr: string,
    staffId?: string,
    locationId?: string,
  ): Promise<TimeSlot[]> {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new NotFoundException('Invalid date');
    }

    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, businessId, isActive: true },
    });
    if (!service) throw new NotFoundException('Service not found');

    const staffIds = staffId
      ? [staffId]
      : (
          await this.prisma.staffService.findMany({
            where: { serviceId, staff: { businessId, isActive: true } },
            select: { staffId: true },
          })
        ).map((s) => s.staffId);

    if (staffIds.length === 0) return [];

    const dayOfWeek = date.getDay();
    const dateOnly = dateStr.slice(0, 10);

    const allSlots: TimeSlot[] = [];

    for (const sid of staffIds) {
      const staff = await this.prisma.staffMember.findFirst({
        where: { id: sid, businessId, isActive: true },
      });
      if (!staff) continue;

      const slots = await this.generateSlotsForStaff(
        sid,
        service,
        date,
        dayOfWeek,
        dateOnly,
        businessId,
        locationId,
      );
      allSlots.push(...slots);
    }

    allSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return allSlots;
  }

  private async generateSlotsForStaff(
    staffId: string,
    service: {
      durationMinutes: number;
      bufferBeforeMinutes: number;
      bufferAfterMinutes: number;
    },
    date: Date,
    dayOfWeek: number,
    dateOnly: string,
    businessId: string,
    locationId?: string,
  ): Promise<TimeSlot[]> {
    const location = locationId
      ? await this.prisma.location.findFirst({
          where: { id: locationId, businessId },
          include: { businessHours: true },
        })
      : await this.prisma.location.findFirst({
          where: { businessId },
          include: { businessHours: true },
        });

    const dayHours = location?.businessHours.find(
      (h) => h.dayOfWeek === dayOfWeek,
    );
    const openTime = dayHours?.isClosed
      ? null
      : (dayHours?.openTime ?? '09:00');
    const closeTime = dayHours?.isClosed
      ? null
      : (dayHours?.closeTime ?? '17:00');

    if (!openTime || !closeTime) return [];

    const staffSchedule = await this.prisma.staffSchedule.findUnique({
      where: { staffId_dayOfWeek: { staffId, dayOfWeek } },
    });

    if (!staffSchedule?.isAvailable) return [];

    const scheduleStart = this.parseTime(staffSchedule.startTime);
    const scheduleEnd = this.parseTime(staffSchedule.endTime);
    const bizStart = this.parseTime(openTime);
    const bizEnd = this.parseTime(closeTime);

    const slotStartMinutes = Math.max(scheduleStart, bizStart);
    const slotEndMinutes = Math.min(scheduleEnd, bizEnd);

    if (slotStartMinutes >= slotEndMinutes) return [];

    const overrides = await this.prisma.availabilityOverride.findMany({
      where: {
        staffId,
        date: new Date(dateOnly),
        isAvailable: false,
      },
    });

    const totalDuration =
      service.bufferBeforeMinutes +
      service.durationMinutes +
      service.bufferAfterMinutes;
    const slots: TimeSlot[] = [];
    const dateStr = dateOnly;

    for (
      let mins = slotStartMinutes;
      mins + totalDuration <= slotEndMinutes;
      mins += 15
    ) {
      const startTime = this.minutesToTime(mins);
      const endTime = this.minutesToTime(mins + totalDuration);

      const blockedByOverride = overrides.some((ov) => {
        const ovStart = this.parseTime(ov.startTime);
        const ovEnd = this.parseTime(ov.endTime);
        return mins < ovEnd && mins + totalDuration > ovStart;
      });
      if (blockedByOverride) continue;

      const slotDateTimeStart = new Date(`${dateStr}T${startTime}:00`);
      const slotDateTimeEnd = new Date(`${dateStr}T${endTime}:00`);

      const conflicting = await this.prisma.appointment.findFirst({
        where: {
          staffId,
          status: { notIn: ['cancelled', 'no_show'] },
          OR: [
            {
              startTime: { lt: slotDateTimeEnd },
              endTime: { gt: slotDateTimeStart },
            },
          ],
        },
      });

      if (conflicting) continue;

      slots.push({
        startTime: `${dateStr}T${startTime}:00`,
        endTime: `${dateStr}T${endTime}:00`,
        staffId,
      });
    }

    return slots;
  }

  private parseTime(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  }

  private minutesToTime(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  async createOverride(
    businessId: string,
    staffId: string,
    user: { id: string },
    data: {
      date: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
      reason?: string;
    },
  ) {
    const business = await this.prisma.business.findFirst({
      where: { id: businessId, ownerId: user.id },
    });
    if (!business) throw new NotFoundException('Business not found');

    const staff = await this.prisma.staffMember.findFirst({
      where: { id: staffId, businessId },
    });
    if (!staff) throw new NotFoundException('Staff not found');

    return this.prisma.availabilityOverride.create({
      data: {
        staffId,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        isAvailable: data.isAvailable,
        reason: data.reason?.trim() || null,
      },
    });
  }
}
