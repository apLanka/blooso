import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalBusinesses,
      totalAppointments,
      totalApplications,
      recentApplications,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.business.count(),
      this.prisma.appointment.count(),
      this.prisma.businessApplication.count(),
      this.prisma.businessApplication.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    // Calculate total revenue from all completed payments across the platform
    const revenueAgg = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'completed' },
    });

    return {
      totalUsers,
      totalBusinesses,
      totalAppointments,
      totalApplications,
      totalRevenue: revenueAgg._sum.amount || 0,
      recentApplications,
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        businesses: { select: { id: true } },
      },
    });
  }

  async getBusinesses() {
    return this.prisma.business.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { appointments: true, staffMembers: true } },
      },
    });
  }
}
