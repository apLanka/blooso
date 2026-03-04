import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { BookingService } from './booking.service';
import { PrismaService } from '../prisma/prisma.service';
import { AvailabilityService } from '../availability/availability.service';
import { NotificationService } from '../notification/notification.service';
import { ClientService } from '../client/client.service';

const mockPrisma = {
  business: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  location: {
    findFirst: jest.fn(),
  },
  staffMember: {
    findFirst: jest.fn(),
  },
  service: {
    findMany: jest.fn(),
  },
  staffService: {
    findMany: jest.fn(),
  },
  appointment: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  appointmentService: {
    createMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockAvailabilityService = {
  getAvailableSlots: jest.fn(),
};

const mockNotificationService = {
  sendBookingConfirmation: jest.fn().mockResolvedValue(undefined),
};

const mockClientService = {
  findOrCreateByEmail: jest.fn(),
};

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockPrisma));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AvailabilityService, useValue: mockAvailabilityService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ClientService, useValue: mockClientService },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
  });

  describe('createBooking', () => {
    const validDto = {
      businessId: 'b-1',
      locationId: 'loc-1',
      staffId: 'staff-1',
      serviceIds: ['s-1'],
      startTime: '2026-06-15T10:00:00',
    };

    it('should throw NotFoundException when business not found', async () => {
      mockPrisma.business.findUnique.mockResolvedValue(null);

      await expect(
        service.createBooking(validDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when location not found', async () => {
      mockPrisma.business.findUnique.mockResolvedValue({
        id: 'b-1',
        locations: [{ id: 'loc-2' }],
      });

      await expect(
        service.createBooking(validDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when staff not found', async () => {
      mockPrisma.business.findUnique.mockResolvedValue({
        id: 'b-1',
        locations: [{ id: 'loc-1' }],
      });
      mockPrisma.staffMember.findFirst.mockResolvedValue(null);

      await expect(
        service.createBooking(validDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when service not found', async () => {
      mockPrisma.business.findUnique.mockResolvedValue({
        id: 'b-1',
        locations: [{ id: 'loc-1' }],
      });
      mockPrisma.staffMember.findFirst.mockResolvedValue({
        id: 'staff-1',
        businessId: 'b-1',
        isActive: true,
      });
      mockPrisma.service.findMany.mockResolvedValue([]);

      await expect(
        service.createBooking(validDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when staff cannot perform service', async () => {
      mockPrisma.business.findUnique.mockResolvedValue({
        id: 'b-1',
        locations: [{ id: 'loc-1' }],
      });
      mockPrisma.staffMember.findFirst.mockResolvedValue({
        id: 'staff-1',
        businessId: 'b-1',
        isActive: true,
      });
      mockPrisma.service.findMany.mockResolvedValue([
        { id: 's-1', bufferBeforeMinutes: 0, durationMinutes: 60, bufferAfterMinutes: 0, price: 50 },
      ]);
      mockPrisma.staffService.findMany.mockResolvedValue([]);

      await expect(
        service.createBooking(validDto)
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for invalid start time', async () => {
      mockPrisma.business.findUnique.mockResolvedValue({
        id: 'b-1',
        locations: [{ id: 'loc-1' }],
      });
      mockPrisma.staffMember.findFirst.mockResolvedValue({
        id: 'staff-1',
        businessId: 'b-1',
        isActive: true,
      });
      mockPrisma.service.findMany.mockResolvedValue([
        { id: 's-1', bufferBeforeMinutes: 0, durationMinutes: 60, bufferAfterMinutes: 0, price: 50 },
      ]);
      mockPrisma.staffService.findMany.mockResolvedValue([
        { staffId: 'staff-1', serviceId: 's-1' },
      ]);

      await expect(
        service.createBooking({
          ...validDto,
          startTime: 'invalid',
        })
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when slot has conflicting appointment', async () => {
      mockPrisma.business.findUnique.mockResolvedValue({
        id: 'b-1',
        locations: [{ id: 'loc-1' }],
      });
      mockPrisma.staffMember.findFirst.mockResolvedValue({
        id: 'staff-1',
        businessId: 'b-1',
        isActive: true,
      });
      mockPrisma.service.findMany.mockResolvedValue([
        { id: 's-1', bufferBeforeMinutes: 0, durationMinutes: 60, bufferAfterMinutes: 0, price: 50 },
      ]);
      mockPrisma.staffService.findMany.mockResolvedValue([
        { staffId: 'staff-1', serviceId: 's-1' },
      ]);
      mockPrisma.appointment.findFirst.mockResolvedValue({
        id: 'apt-1',
        staffId: 'staff-1',
        startTime: new Date('2026-06-15T10:00:00'),
        endTime: new Date('2026-06-15T11:00:00'),
      });

      await expect(
        service.createBooking(validDto)
      ).rejects.toThrow(ConflictException);
    });

    it('should create booking when slot is available', async () => {
      mockPrisma.business.findUnique.mockResolvedValue({
        id: 'b-1',
        locations: [{ id: 'loc-1' }],
      });
      mockPrisma.staffMember.findFirst.mockResolvedValue({
        id: 'staff-1',
        businessId: 'b-1',
        isActive: true,
      });
      mockPrisma.service.findMany.mockResolvedValue([
        { id: 's-1', bufferBeforeMinutes: 0, durationMinutes: 60, bufferAfterMinutes: 0, price: 50 },
      ]);
      mockPrisma.staffService.findMany.mockResolvedValue([
        { staffId: 'staff-1', serviceId: 's-1' },
      ]);
      mockPrisma.appointment.findFirst.mockResolvedValue(null);
      mockPrisma.appointment.create.mockResolvedValue({
        id: 'apt-1',
        businessId: 'b-1',
        locationId: 'loc-1',
        staffId: 'staff-1',
        clientId: null,
        startTime: new Date('2026-06-15T10:00:00'),
        endTime: new Date('2026-06-15T11:00:00'),
        status: 'pending',
        totalPrice: 50,
        staff: { user: { name: 'Staff', email: 'staff@test.com' } },
        appointmentServices: [{ service: { name: 'Haircut' } }],
        location: {},
        business: {},
      });
      mockPrisma.appointmentService.createMany.mockResolvedValue({});
      mockPrisma.appointment.findUnique.mockResolvedValue({
        id: 'apt-1',
        staff: { user: { name: 'Staff', email: 'staff@test.com' } },
        appointmentServices: [{ service: { name: 'Haircut' } }],
        location: {},
        business: {},
      });

      const result = await service.createBooking(validDto);

      expect(result).toHaveProperty('id', 'apt-1');
      expect(mockPrisma.appointment.create).toHaveBeenCalled();
    });
  });
});
