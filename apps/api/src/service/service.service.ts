import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderItemDto } from './dto/reorder-categories.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureBusinessAccess(businessId: string, user: JwtUser) {
    const business = await this.prisma.business.findFirst({
      where: { id: businessId, ownerId: user.id },
    });
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return business;
  }

  // Categories
  async createCategory(
    businessId: string,
    user: JwtUser,
    dto: CreateCategoryDto,
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const maxOrder = await this.prisma.serviceCategory
      .aggregate({
        where: { businessId },
        _max: { sortOrder: true },
      })
      .then((r) => (r._max.sortOrder ?? -1) + 1);

    return this.prisma.serviceCategory.create({
      data: {
        businessId,
        name: dto.name.trim(),
        sortOrder: dto.sortOrder ?? maxOrder,
      },
    });
  }

  async findCategories(businessId: string, user: JwtUser) {
    await this.ensureBusinessAccess(businessId, user);

    return this.prisma.serviceCategory.findMany({
      where: { businessId },
      orderBy: { sortOrder: 'asc' },
      include: {
        services: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async updateCategory(
    businessId: string,
    categoryId: string,
    user: JwtUser,
    dto: UpdateCategoryDto,
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const cat = await this.prisma.serviceCategory.findFirst({
      where: { id: categoryId, businessId },
    });
    if (!cat) throw new NotFoundException('Category not found');

    return this.prisma.serviceCategory.update({
      where: { id: categoryId },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async deleteCategory(businessId: string, categoryId: string, user: JwtUser) {
    await this.ensureBusinessAccess(businessId, user);

    const cat = await this.prisma.serviceCategory.findFirst({
      where: { id: categoryId, businessId },
    });
    if (!cat) throw new NotFoundException('Category not found');

    return this.prisma.serviceCategory.delete({
      where: { id: categoryId },
    });
  }

  async reorderCategories(
    businessId: string,
    user: JwtUser,
    items: ReorderItemDto[],
  ) {
    await this.ensureBusinessAccess(businessId, user);

    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.serviceCategory.updateMany({
          where: { id: item.id, businessId },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return this.findCategories(businessId, user);
  }

  // Services
  async createService(
    businessId: string,
    user: JwtUser,
    dto: CreateServiceDto,
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const category = await this.prisma.serviceCategory.findFirst({
      where: { id: dto.categoryId, businessId },
    });
    if (!category) throw new NotFoundException('Category not found');

    const maxOrder = await this.prisma.service
      .aggregate({
        where: { categoryId: dto.categoryId },
        _max: { sortOrder: true },
      })
      .then((r) => (r._max.sortOrder ?? -1) + 1);

    return this.prisma.service.create({
      data: {
        businessId,
        categoryId: dto.categoryId,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        durationMinutes: dto.durationMinutes,
        price: dto.price,
        bufferBeforeMinutes: dto.bufferBeforeMinutes ?? 0,
        bufferAfterMinutes: dto.bufferAfterMinutes ?? 0,
        isActive: dto.isActive ?? true,
        sortOrder: maxOrder,
      },
      include: { category: true },
    });
  }

  async findServices(businessId: string, user: JwtUser) {
    await this.ensureBusinessAccess(businessId, user);

    return this.prisma.service.findMany({
      where: { businessId },
      include: { category: true },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    });
  }

  async updateService(
    businessId: string,
    serviceId: string,
    user: JwtUser,
    dto: UpdateServiceDto,
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const svc = await this.prisma.service.findFirst({
      where: { id: serviceId, businessId },
    });
    if (!svc) throw new NotFoundException('Service not found');

    if (dto.categoryId) {
      const cat = await this.prisma.serviceCategory.findFirst({
        where: { id: dto.categoryId, businessId },
      });
      if (!cat) throw new NotFoundException('Category not found');
    }

    return this.prisma.service.update({
      where: { id: serviceId },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.durationMinutes !== undefined && {
          durationMinutes: dto.durationMinutes,
        }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.bufferBeforeMinutes !== undefined && {
          bufferBeforeMinutes: dto.bufferBeforeMinutes,
        }),
        ...(dto.bufferAfterMinutes !== undefined && {
          bufferAfterMinutes: dto.bufferAfterMinutes,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: { category: true },
    });
  }

  async deleteService(businessId: string, serviceId: string, user: JwtUser) {
    await this.ensureBusinessAccess(businessId, user);

    const svc = await this.prisma.service.findFirst({
      where: { id: serviceId, businessId },
    });
    if (!svc) throw new NotFoundException('Service not found');

    return this.prisma.service.delete({
      where: { id: serviceId },
    });
  }

  // Public: services by business slug (active only, grouped by category)
  async findServicesBySlug(slug: string) {
    const business = await this.prisma.business.findUnique({
      where: { slug },
    });
    if (!business) throw new NotFoundException('Business not found');

    const categories = await this.prisma.serviceCategory.findMany({
      where: { businessId: business.id },
      orderBy: { sortOrder: 'asc' },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return categories.filter((c) => c.services.length > 0);
  }
}
