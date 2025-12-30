import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateUniqueSlug } from './business.utils';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { BusinessHoursItemDto } from './dto/business-hours.dto';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: JwtUser, dto: CreateBusinessDto) {
    const slug = await generateUniqueSlug(this.prisma, dto.name);

    return this.prisma.business.create({
      data: {
        ownerId: user.id,
        name: dto.name.trim(),
        slug,
        category: dto.category,
        description: dto.description?.trim() || null,
        settings: {},
      },
      include: {
        locations: {
          include: { businessHours: true },
        },
      },
    });
  }

  async findById(id: string, user: JwtUser) {
    const business = await this.prisma.business.findFirst({
      where: {
        id,
        ownerId: user.id,
      },
      include: {
        locations: {
          include: { businessHours: { orderBy: { dayOfWeek: 'asc' } } },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async findBySlug(slug: string) {
    const business = await this.prisma.business.findUnique({
      where: { slug },
      include: {
        locations: {
          include: { businessHours: { orderBy: { dayOfWeek: 'asc' } } },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async update(id: string, user: JwtUser, dto: UpdateBusinessDto) {
    await this.findById(id, user);

    return this.prisma.business.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.settings !== undefined && {
          settings: dto.settings as object,
        }),
      },
      include: {
        locations: {
          include: { businessHours: true },
        },
      },
    });
  }

  async createLocation(
    businessId: string,
    user: JwtUser,
    dto: CreateLocationDto,
  ) {
    await this.findById(businessId, user);

    return this.prisma.location.create({
      data: {
        businessId,
        name: dto.name.trim(),
        address: dto.address.trim(),
        city: dto.city?.trim() || null,
        state: dto.state?.trim() || null,
        postalCode: dto.postalCode?.trim() || null,
        country: dto.country.trim(),
        lat: dto.lat ?? null,
        lng: dto.lng ?? null,
        timezone: dto.timezone || 'UTC',
        phone: dto.phone?.trim() || null,
      },
    });
  }

  async updateLocation(
    businessId: string,
    locationId: string,
    user: JwtUser,
    dto: UpdateLocationDto,
  ) {
    await this.findById(businessId, user);

    const location = await this.prisma.location.findFirst({
      where: { id: locationId, businessId },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return this.prisma.location.update({
      where: { id: locationId },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.address !== undefined && { address: dto.address.trim() }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.postalCode !== undefined && { postalCode: dto.postalCode }),
        ...(dto.country !== undefined && { country: dto.country.trim() }),
        ...(dto.lat !== undefined && { lat: dto.lat }),
        ...(dto.lng !== undefined && { lng: dto.lng }),
        ...(dto.timezone !== undefined && { timezone: dto.timezone }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
    });
  }

  async setBusinessHours(
    businessId: string,
    locationId: string,
    user: JwtUser,
    hours: BusinessHoursItemDto[],
  ) {
    await this.findById(businessId, user);

    const location = await this.prisma.location.findFirst({
      where: { id: locationId, businessId },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    await this.prisma.businessHours.deleteMany({
      where: { locationId },
    });

    if (hours.length > 0) {
      await this.prisma.businessHours.createMany({
        data: hours.map((h) => ({
          locationId,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
        })),
      });
    }

    return this.prisma.businessHours.findMany({
      where: { locationId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async findMyBusinesses(user: JwtUser) {
    return this.prisma.business.findMany({
      where: { ownerId: user.id },
      include: {
        locations: {
          include: { businessHours: { orderBy: { dayOfWeek: 'asc' } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
