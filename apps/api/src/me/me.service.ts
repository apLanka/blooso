import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(user: JwtUser) {
    const profile = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });
    if (!profile) throw new NotFoundException('User not found');
    return profile;
  }

  async updateProfile(user: JwtUser, dto: UpdateProfileDto) {
    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing) throw new ConflictException('Email already in use');
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });
  }
}
