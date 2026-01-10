import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { StaffRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffScheduleItemDto } from './dto/staff-schedule.dto';

const SALT_ROUNDS = 10;

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureBusinessAccess(businessId: string, user: JwtUser) {
    const business = await this.prisma.business.findFirst({
      where: { id: businessId, ownerId: user.id },
    });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async create(businessId: string, user: JwtUser, dto: CreateStaffDto) {
    await this.ensureBusinessAccess(businessId, user);

    const email = dto.email.toLowerCase().trim();

    let dbUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser) {
      const tempPassword = await bcrypt.hash(
        randomBytes(32).toString('hex') + Date.now(),
        SALT_ROUNDS,
      );
      dbUser = await this.prisma.user.create({
        data: {
          email,
          password: tempPassword,
          name: dto.name.trim(),
        },
      });
    }

    const existing = await this.prisma.staffMember.findUnique({
      where: {
        userId_businessId: { userId: dbUser.id, businessId },
      },
    });
    if (existing) {
      throw new ConflictException('User is already staff in this business');
    }

    return this.prisma.staffMember.create({
      data: {
        userId: dbUser.id,
        businessId,
        role: dto.role as StaffRole,
        commissionRate: dto.commissionRate ?? 0,
        bio: dto.bio?.trim() || null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        staffSchedules: true,
        staffServices: { include: { service: { select: { name: true } } } },
      },
    });
  }

  async findAll(businessId: string, user: JwtUser) {
    await this.ensureBusinessAccess(businessId, user);

    return this.prisma.staffMember.findMany({
      where: { businessId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        staffSchedules: true,
        staffServices: { include: { service: { select: { name: true } } } },
      },
    });
  }

  async findOne(businessId: string, staffId: string, user: JwtUser) {
    await this.ensureBusinessAccess(businessId, user);

    const staff = await this.prisma.staffMember.findFirst({
      where: { id: staffId, businessId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        staffSchedules: { orderBy: { dayOfWeek: 'asc' } },
        staffServices: {
          include: { service: { select: { id: true, name: true } } },
        },
      },
    });
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async update(
    businessId: string,
    staffId: string,
    user: JwtUser,
    dto: UpdateStaffDto,
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const staff = await this.prisma.staffMember.findFirst({
      where: { id: staffId, businessId },
    });
    if (!staff) throw new NotFoundException('Staff not found');

    if (dto.name) {
      await this.prisma.user.update({
        where: { id: staff.userId },
        data: { name: dto.name.trim() },
      });
    }

    return this.prisma.staffMember.update({
      where: { id: staffId },
      data: {
        ...(dto.role !== undefined && { role: dto.role as StaffRole }),
        ...(dto.commissionRate !== undefined && {
          commissionRate: dto.commissionRate,
        }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        staffSchedules: true,
        staffServices: { include: { service: { select: { name: true } } } },
      },
    });
  }

  async remove(businessId: string, staffId: string, user: JwtUser) {
    await this.ensureBusinessAccess(businessId, user);

    const staff = await this.prisma.staffMember.findFirst({
      where: { id: staffId, businessId },
    });
    if (!staff) throw new NotFoundException('Staff not found');

    await this.prisma.staffMember.update({
      where: { id: staffId },
      data: { isActive: false },
    });

    return { message: 'Staff deactivated' };
  }

  async setServices(
    businessId: string,
    staffId: string,
    user: JwtUser,
    serviceIds: string[],
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const staff = await this.prisma.staffMember.findFirst({
      where: { id: staffId, businessId },
    });
    if (!staff) throw new NotFoundException('Staff not found');

    for (const sid of serviceIds) {
      const svc = await this.prisma.service.findFirst({
        where: { id: sid, businessId },
      });
      if (!svc) throw new NotFoundException(`Service ${sid} not found`);
    }

    await this.prisma.staffService.deleteMany({
      where: { staffId },
    });

    if (serviceIds.length > 0) {
      await this.prisma.staffService.createMany({
        data: serviceIds.map((serviceId) => ({
          staffId,
          serviceId,
        })),
      });
    }

    return this.findOne(businessId, staffId, user);
  }

  async setSchedule(
    businessId: string,
    staffId: string,
    user: JwtUser,
    items: StaffScheduleItemDto[],
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const staff = await this.prisma.staffMember.findFirst({
      where: { id: staffId, businessId },
    });
    if (!staff) throw new NotFoundException('Staff not found');

    await this.prisma.staffSchedule.deleteMany({
      where: { staffId },
    });

    if (items.length > 0) {
      await this.prisma.staffSchedule.createMany({
        data: items.map((item) => ({
          staffId,
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
          isAvailable: item.isAvailable,
        })),
      });
    }

    return this.prisma.staffSchedule.findMany({
      where: { staffId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }
}
