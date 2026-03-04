import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';

const mockConstructEvent = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  }));
});

const mockPrisma = {
  payment: { create: jest.fn(),
  findFirst: jest.fn(),
  },
  appointment: { update: jest.fn(), findFirst: jest.fn() },
  $transaction: jest.fn(),
};

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (ops) => {
      if (Array.isArray(ops)) {
        return ops.map((op) => op);
      }
      return ops(mockPrisma);
    });
    const mockConfig = {
      get: jest.fn((key: string) => {
        if (key === 'STRIPE_SECRET_KEY') return 'sk_test_xxx';
        if (key === 'STRIPE_WEBHOOK_SECRET') return 'whsec_xxx';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  describe('handleWebhook', () => {
    it('should throw BadRequestException when webhook not configured', async () => {
      const moduleWithoutConfig = await Test.createTestingModule({
        providers: [
          PaymentService,
          { provide: PrismaService, useValue: mockPrisma },
          {
            provide: ConfigService,
            useValue: { get: jest.fn().mockReturnValue(undefined) },
          },
        ],
      }).compile();
      const svc = moduleWithoutConfig.get<PaymentService>(PaymentService);

      await expect(
        svc.handleWebhook(Buffer.from('{}'), 'sig')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid signature', async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(
        service.handleWebhook(Buffer.from('{}'), 'invalid-sig')
      ).rejects.toThrow(BadRequestException);
    });

    it('should process checkout.session.completed and update appointment', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { appointmentId: 'apt-1' },
            amount_total: 5000,
            payment_intent: 'pi_xxx',
          },
        },
      });
      mockPrisma.payment.create.mockResolvedValue({ id: 'pay-1' });
      mockPrisma.appointment.update.mockResolvedValue({});

      await service.handleWebhook(
        Buffer.from(JSON.stringify({ type: 'checkout.session.completed' })),
        'valid-sig'
      );

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should skip when metadata has no appointmentId', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: {},
            amount_total: 5000,
          },
        },
      });

      await service.handleWebhook(Buffer.from('{}'), 'valid-sig');

      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
