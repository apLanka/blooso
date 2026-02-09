import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateNoteDto } from './dto/create-note.dto';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureBusinessAccess(businessId: string, user: JwtUser) {
    const business = await this.prisma.business.findFirst({
      where: { id: businessId, ownerId: user.id },
    });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async create(businessId: string, user: JwtUser, dto: CreateClientDto) {
    await this.ensureBusinessAccess(businessId, user);

    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.client.findUnique({
      where: { businessId_email: { businessId, email } },
    });
    if (existing) {
      throw new ConflictException('A client with this email already exists');
    }

    return this.prisma.client.create({
      data: {
        businessId,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email,
        phone: dto.phone?.trim() || null,
        dateOfBirth: dto.dateOfBirth
          ? new Date(dto.dateOfBirth)
          : null,
        preferences: (dto.preferences as object) ?? {},
      },
      include: {
        tags: true,
      },
    });
  }

  async findAll(
    businessId: string,
    user: JwtUser,
    query: { search?: string; page?: number; limit?: number },
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: { businessId: string; OR?: Array<Record<string, unknown>> } = {
      businessId,
    };

    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        include: {
          tags: true,
          _count: {
            select: { appointments: true },
          },
        },
      }),
      this.prisma.client.count({ where }),
    ]);

    const clientsWithStats = await Promise.all(
      clients.map(async (c) => {
        const lastAppointment = await this.prisma.appointment.findFirst({
          where: { clientId: c.id },
          orderBy: { startTime: 'desc' },
          select: { startTime: true },
        });
        return {
          ...c,
          totalVisits: c._count.appointments,
          lastVisit: lastAppointment?.startTime ?? null,
        };
      }),
    );

    return {
      data: clientsWithStats.map(({ _count, ...rest }) => rest),
      total,
      page,
      limit,
    };
  }

  async findOne(businessId: string, clientId: string, user: JwtUser) {
    await this.ensureBusinessAccess(businessId, user);

    const client = await this.prisma.client.findFirst({
      where: { id: clientId, businessId },
      include: {
        tags: true,
        _count: { select: { appointments: true } },
      },
    });
    if (!client) throw new NotFoundException('Client not found');

    const lastAppointment = await this.prisma.appointment.findFirst({
      where: { clientId },
      orderBy: { startTime: 'desc' },
    });

    const { _count, ...rest } = client;
    return {
      ...rest,
      totalVisits: _count.appointments,
      lastVisit: lastAppointment?.startTime ?? null,
    };
  }

  async update(
    businessId: string,
    clientId: string,
    user: JwtUser,
    dto: UpdateClientDto,
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const client = await this.prisma.client.findFirst({
      where: { id: clientId, businessId },
    });
    if (!client) throw new NotFoundException('Client not found');

    if (dto.email && dto.email.toLowerCase().trim() !== client.email) {
      const existing = await this.prisma.client.findUnique({
        where: {
          businessId_email: {
            businessId,
            email: dto.email.toLowerCase().trim(),
          },
        },
      });
      if (existing) {
        throw new ConflictException('A client with this email already exists');
      }
    }

    return this.prisma.client.update({
      where: { id: clientId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName.trim() }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName.trim() }),
        ...(dto.email !== undefined && {
          email: dto.email.toLowerCase().trim(),
        }),
        ...(dto.phone !== undefined && {
          phone: dto.phone?.trim() || null,
        }),
        ...(dto.dateOfBirth !== undefined && {
          dateOfBirth: dto.dateOfBirth
            ? new Date(dto.dateOfBirth)
            : null,
        }),
        ...(dto.preferences !== undefined && {
          preferences: dto.preferences as object,
        }),
      },
      include: { tags: true },
    });
  }

  async remove(businessId: string, clientId: string, user: JwtUser) {
    await this.ensureBusinessAccess(businessId, user);

    const client = await this.prisma.client.findFirst({
      where: { id: clientId, businessId },
    });
    if (!client) throw new NotFoundException('Client not found');

    await this.prisma.client.delete({ where: { id: clientId } });
    return { deleted: true };
  }

  async createNote(
    businessId: string,
    clientId: string,
    user: JwtUser,
    dto: CreateNoteDto,
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const client = await this.prisma.client.findFirst({
      where: { id: clientId, businessId },
    });
    if (!client) throw new NotFoundException('Client not found');

    return this.prisma.clientNote.create({
      data: {
        clientId,
        content: dto.content.trim(),
        isPrivate: dto.isPrivate ?? false,
        authorId: user.id,
      },
    });
  }

  async listNotes(
    businessId: string,
    clientId: string,
    user: JwtUser,
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const client = await this.prisma.client.findFirst({
      where: { id: clientId, businessId },
    });
    if (!client) throw new NotFoundException('Client not found');

    return this.prisma.clientNote.findMany({
      where: {
        clientId,
        OR: [
          { isPrivate: false },
          { authorId: user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteNote(
    businessId: string,
    clientId: string,
    noteId: string,
    user: JwtUser,
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const note = await this.prisma.clientNote.findFirst({
      where: { id: noteId, clientId },
      include: { client: true },
    });
    if (!note || note.client.businessId !== businessId) {
      throw new NotFoundException('Note not found');
    }
    if (note.authorId !== user.id) {
      throw new ForbiddenException('You can only delete your own notes');
    }

    await this.prisma.clientNote.delete({ where: { id: noteId } });
    return { deleted: true };
  }

  async addTag(
    businessId: string,
    clientId: string,
    user: JwtUser,
    tag: string,
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const client = await this.prisma.client.findFirst({
      where: { id: clientId, businessId },
    });
    if (!client) throw new NotFoundException('Client not found');

    const normalizedTag = tag.trim().toLowerCase();
    if (!normalizedTag) {
      throw new ConflictException('Tag cannot be empty');
    }

    const existing = await this.prisma.clientTag.findUnique({
      where: { clientId_tag: { clientId, tag: normalizedTag } },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.clientTag.create({
      data: { clientId, tag: normalizedTag },
    });
  }

  async removeTag(
    businessId: string,
    clientId: string,
    tag: string,
    user: JwtUser,
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const client = await this.prisma.client.findFirst({
      where: { id: clientId, businessId },
    });
    if (!client) throw new NotFoundException('Client not found');

    const normalizedTag = tag.trim().toLowerCase();
    const clientTag = await this.prisma.clientTag.findUnique({
      where: { clientId_tag: { clientId, tag: normalizedTag } },
    });
    if (!clientTag) {
      throw new NotFoundException('Tag not found');
    }

    await this.prisma.clientTag.delete({
      where: { id: clientTag.id },
    });
    return { deleted: true };
  }

  async getAppointments(
    businessId: string,
    clientId: string,
    user: JwtUser,
  ) {
    await this.ensureBusinessAccess(businessId, user);

    const client = await this.prisma.client.findFirst({
      where: { id: clientId, businessId },
    });
    if (!client) throw new NotFoundException('Client not found');

    return this.prisma.appointment.findMany({
      where: { clientId },
      orderBy: { startTime: 'desc' },
      include: {
        staff: {
          include: { user: { select: { name: true } } },
        },
        appointmentServices: {
          include: { service: { select: { name: true } } },
        },
      },
    });
  }

  async findOrCreateByEmail(
    businessId: string,
    data: {
      email: string;
      firstName?: string;
      lastName?: string;
      guestName?: string;
      phone?: string;
    },
  ): Promise<string | null> {
    const email = data.email?.toLowerCase().trim();
    if (!email) return null;

    let client = await this.prisma.client.findUnique({
      where: { businessId_email: { businessId, email } },
    });

    if (!client) {
      const fullName =
        [data.firstName, data.lastName].filter(Boolean).join(' ') ||
        data.guestName?.trim() ||
        'Guest';
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = data.firstName?.trim() ?? nameParts[0] ?? 'Guest';
      const lastName =
        data.lastName?.trim() ?? (nameParts.slice(1).join(' ').trim() || '');

      client = await this.prisma.client.create({
        data: {
          businessId,
          firstName,
          lastName,
          email,
          phone: data.phone?.trim() || null,
        },
      });
    }

    return client.id;
  }
}
