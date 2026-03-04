import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  service: {
    findFirst: jest.fn(),
  },
  staffService: {
    findMany: jest.fn(),
  },
  staffMember: {
    findFirst: jest.fn(),
  },
  location: {
    findFirst: jest.fn(),
  },
  businessHours: {},
  staffSchedule: {
    findUnique: jest.fn(),
  },
  availabilityOverride: {
    findMany: jest.fn(),
  },
  appointment: {
    findFirst: jest.fn(),
  },
};

describe('AvailabilityService', () => {
  let service: AvailabilityService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
  });

  describe('getAvailableSlots', () => {
    it('should throw NotFoundException for invalid date', async () => {
      await expect(
        service.getAvailableSlots('b-1', 's-1', 'invalid-date')
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.service.findFirst).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when service not found', async () => {
      mockPrisma.service.findFirst.mockResolvedValue(null);

      await expect(
        service.getAvailableSlots('b-1', 's-1', '2026-06-15')
      ).rejects.toThrow(NotFoundException);
    });

    it('should return empty array when no staff can perform service', async () => {
      mockPrisma.service.findFirst.mockResolvedValue({
        id: 's-1',
        durationMinutes: 60,
        bufferBeforeMinutes: 0,
        bufferAfterMinutes: 0,
      });
      mockPrisma.staffService.findMany.mockResolvedValue([]);

      const slots = await service.getAvailableSlots(
        'b-1',
        's-1',
        '2026-06-15'
      );

      expect(slots).toEqual([]);
    });

    it('should return empty array when staff has no schedule', async () => {
      mockPrisma.service.findFirst.mockResolvedValue({
        id: 's-1',
        durationMinutes: 60,
        bufferBeforeMinutes: 0,
        bufferAfterMinutes: 0,
      });
      mockPrisma.staffService.findMany.mockResolvedValue([]);
      mockPrisma.staffMember.findFirst.mockResolvedValue({
        id: 'staff-1',
        businessId: 'b-1',
        isActive: true,
      });
      mockPrisma.location.findFirst.mockResolvedValue({
        id: 'loc-1',
        businessId: 'b-1',
        businessHours: [
          {
            dayOfWeek: 1,
            openTime: '09:00',
            closeTime: '17:00',
            isClosed: false,
          },
        ],
      });
      mockPrisma.staffSchedule.findUnique.mockResolvedValue(null);

      const slots = await service.getAvailableSlots(
        'b-1',
        's-1',
        '2026-06-15',
        'staff-1'
      );

      expect(slots).toEqual([]);
    });

    it('should return slots when staff has schedule and business is open', async () => {
      mockPrisma.service.findFirst.mockResolvedValue({
        id: 's-1',
        durationMinutes: 60,
        bufferBeforeMinutes: 0,
        bufferAfterMinutes: 0,
      });
      mockPrisma.staffMember.findFirst.mockResolvedValue({
        id: 'staff-1',
        businessId: 'b-1',
        isActive: true,
      });
      mockPrisma.location.findFirst.mockResolvedValue({
        id: 'loc-1',
        businessId: 'b-1',
        businessHours: [
          {
            dayOfWeek: 1,
            openTime: '09:00',
            closeTime: '17:00',
            isClosed: false,
          },
        ],
      });
      mockPrisma.staffSchedule.findUnique.mockResolvedValue({
        staffId: 'staff-1',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      });
      mockPrisma.availabilityOverride.findMany.mockResolvedValue([]);
      mockPrisma.appointment.findFirst.mockResolvedValue(null);

      const slots = await service.getAvailableSlots(
        'b-1',
        's-1',
        '2026-06-15',
        'staff-1'
      );

      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0]).toHaveProperty('startTime');
      expect(slots[0]).toHaveProperty('endTime');
      expect(slots[0]).toHaveProperty('staffId', 'staff-1');
    });
  });
});
