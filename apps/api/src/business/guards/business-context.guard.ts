import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

export const BUSINESS_ID_KEY = 'businessId';

@Injectable()
export class BusinessContextGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const businessId = request.params.id || request.params.businessId;

    if (!user || !businessId) {
      throw new ForbiddenException('Business context required');
    }

    // Admin can access any business
    if (user.role === UserRole.admin) {
      const business = await this.prisma.business.findUnique({
        where: { id: businessId },
      });
      if (business) {
        request[BUSINESS_ID_KEY] = businessId;
        return true;
      }
    }

    // Check ownership or staff membership (for now, only owner)
    const business = await this.prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: user.id,
      },
    });

    if (!business) {
      throw new ForbiddenException('You do not have access to this business');
    }

    request[BUSINESS_ID_KEY] = businessId;
    return true;
  }
}
