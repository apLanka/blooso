import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@Injectable()
export class FavoriteService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: JwtUser) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            category: true,
            avgRating: true,
            reviewCount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => f.business);
  }

  async add(user: JwtUser, businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) throw new NotFoundException('Business not found');

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_businessId: { userId: user.id, businessId } },
    });
    if (existing) throw new ConflictException('Already in favorites');

    return this.prisma.favorite.create({
      data: { userId: user.id, businessId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            category: true,
            avgRating: true,
            reviewCount: true,
          },
        },
      },
    });
  }

  async remove(user: JwtUser, businessId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_businessId: { userId: user.id, businessId } },
    });
    if (!favorite) throw new NotFoundException('Favorite not found');

    await this.prisma.favorite.delete({
      where: { userId_businessId: { userId: user.id, businessId } },
    });

    return { message: 'Removed from favorites' };
  }
}
