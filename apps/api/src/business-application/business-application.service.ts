import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { generateUniqueSlug } from '../business/business.utils';
import { UserRole } from '@prisma/client';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@Injectable()
export class BusinessApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(userId: string, dto: CreateApplicationDto) {
    const existing = await this.prisma.businessApplication.findFirst({
      where: {
        userId,
        status: 'pending',
      },
    });

    if (existing) {
      throw new ConflictException('You already have a pending application');
    }

    return this.prisma.businessApplication.create({
      data: {
        userId,
        name: dto.name.trim(),
        category: dto.category,
        description: dto.description?.trim() || null,
        address: dto.address.trim(),
        city: dto.city?.trim() || null,
        country: dto.country.trim(),
        phone: dto.phone?.trim() || null,
      },
    });
  }

  async getMyApplication(userId: string) {
    return this.prisma.businessApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllPending() {
    return this.prisma.businessApplication.findMany({
      where: { status: 'pending' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getAllApplications() {
    return this.prisma.businessApplication.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async review(
    applicationId: string,
    adminUser: JwtUser,
    dto: ReviewApplicationDto,
  ) {
    const application = await this.prisma.businessApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== 'pending') {
      throw new ConflictException('Application has already been reviewed');
    }

    if (dto.status === 'rejected') {
      return this.prisma.businessApplication.update({
        where: { id: applicationId },
        data: {
          status: 'rejected',
          reviewedBy: adminUser.id,
          reviewedAt: new Date(),
          rejectReason: dto.rejectReason || null,
        },
      });
    }

    // Approved: create business + change user role
    const slug = await generateUniqueSlug(this.prisma, application.name);

    const [updatedApplication, _business, _user] =
      await this.prisma.$transaction([
        this.prisma.businessApplication.update({
          where: { id: applicationId },
          data: {
            status: 'approved',
            reviewedBy: adminUser.id,
            reviewedAt: new Date(),
          },
        }),
        this.prisma.business.create({
          data: {
            ownerId: application.userId,
            name: application.name,
            slug,
            category: application.category,
            description: application.description,
            settings: {},
          },
        }),
        this.prisma.user.update({
          where: { id: application.userId },
          data: { role: UserRole.owner },
        }),
      ]);

    return updatedApplication;
  }
}
