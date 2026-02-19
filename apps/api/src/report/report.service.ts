import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureBusinessAccess(businessId: string, user: JwtUser) {
    const business = await this.prisma.business.findFirst({
      where: { id: businessId, ownerId: user.id },
    });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async getDashboard(businessId: string, user: JwtUser) {
    await this.ensureBusinessAccess(businessId, user);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const [
      todayAppointments,
      todayRevenue,
      weekRevenue,
      totalClients,
      business,
    ] = await Promise.all([
      this.prisma.appointment.count({
        where: {
          businessId,
          status: { notIn: ['cancelled', 'no_show'] },
          startTime: { gte: today, lt: tomorrow },
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          appointment: { businessId },
          status: 'completed',
          createdAt: { gte: today, lt: tomorrow },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          appointment: { businessId },
          status: 'completed',
          createdAt: { gte: weekStart },
        },
        _sum: { amount: true },
      }),
      this.prisma.client.count({ where: { businessId } }),
      this.prisma.business.findUnique({
        where: { id: businessId },
        select: { avgRating: true, reviewCount: true },
      }),
    ]);

    const todaySchedule = await this.prisma.appointment.findMany({
      where: {
        businessId,
        status: { notIn: ['cancelled', 'no_show'] },
        startTime: { gte: today, lt: tomorrow },
      },
      orderBy: { startTime: 'asc' },
      take: 10,
      include: {
        staff: { include: { user: { select: { name: true } } } },
        appointmentServices: {
          include: { service: { select: { name: true } } },
        },
      },
    });

    return {
      todayAppointments,
      todayRevenue: todayRevenue._sum.amount ?? 0,
      weekRevenue: weekRevenue._sum.amount ?? 0,
      totalClients,
      avgRating: business?.avgRating ?? 0,
      reviewCount: business?.reviewCount ?? 0,
      todaySchedule,
    };
  }

  async getRevenue(businessId: string, user: JwtUser, period: string) {
    await this.ensureBusinessAccess(businessId, user);

    const now = new Date();
    let start: Date;
    const groupBy: 'day' | 'week' | 'month' =
      period === 'week' ? 'week' : period === 'month' ? 'month' : 'day';

    if (period === 'week') {
      start = new Date(now);
      start.setDate(start.getDate() - 7);
    } else if (period === 'month') {
      start = new Date(now);
      start.setMonth(start.getMonth() - 1);
    } else {
      start = new Date(now);
      start.setDate(start.getDate() - 7);
    }

    const payments = await this.prisma.payment.findMany({
      where: {
        appointment: { businessId },
        status: 'completed',
        createdAt: { gte: start },
      },
      include: { appointment: true },
    });

    const byDay: Record<string, number> = {};
    for (const p of payments) {
      const key = p.createdAt.toISOString().slice(0, 10);
      byDay[key] = (byDay[key] ?? 0) + p.amount + (p.tipAmount ?? 0);
    }

    const data = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue }));

    return { data };
  }

  async getAppointments(businessId: string, user: JwtUser, period: string) {
    await this.ensureBusinessAccess(businessId, user);

    const now = new Date();
    let start: Date;
    if (period === 'month') {
      start = new Date(now);
      start.setMonth(start.getMonth() - 1);
    } else {
      start = new Date(now);
      start.setDate(start.getDate() - 14);
    }

    const appointments = await this.prisma.appointment.findMany({
      where: {
        businessId,
        startTime: { gte: start },
      },
    });

    const byDay: Record<
      string,
      { total: number; byStatus: Record<string, number> }
    > = {};
    for (const a of appointments) {
      const key = a.startTime.toISOString().slice(0, 10);
      if (!byDay[key]) byDay[key] = { total: 0, byStatus: {} };
      byDay[key].total++;
      byDay[key].byStatus[a.status] = (byDay[key].byStatus[a.status] ?? 0) + 1;
    }

    const data = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date, ...counts }));

    return { data };
  }

  async getClients(businessId: string, user: JwtUser) {
    await this.ensureBusinessAccess(businessId, user);

    const clients = await this.prisma.client.findMany({
      where: { businessId },
      include: {
        _count: { select: { appointments: true } },
      },
    });

    const topByVisits = clients
      .sort((a, b) => b._count.appointments - a._count.appointments)
      .slice(0, 10)
      .map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        visits: c._count.appointments,
      }));

    return { topByVisits };
  }

  async getTopServices(businessId: string, user: JwtUser) {
    await this.ensureBusinessAccess(businessId, user);

    const appointmentServices = await this.prisma.appointmentService.findMany({
      where: {
        appointment: {
          businessId,
          status: { notIn: ['cancelled', 'no_show'] },
        },
      },
      include: {
        service: { select: { name: true } },
      },
    });

    const byService: Record<
      string,
      { count: number; revenue: number; name: string }
    > = {};
    for (const as of appointmentServices) {
      const key = as.serviceId;
      if (!byService[key]) {
        byService[key] = {
          count: 0,
          revenue: 0,
          name: as.service?.name ?? 'Unknown',
        };
      }
      byService[key].count++;
      byService[key].revenue += as.priceCharged;
    }

    const data = Object.entries(byService)
      .map(([id, v]) => ({ serviceId: id, serviceName: v.name, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { data };
  }
}
