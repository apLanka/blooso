import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    findUnique: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

const mockConfig = { get: jest.fn() };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        password: 'hashed',
        avatarUrl: null,
        role: UserRole.client,
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken', 'mock-token');
      expect(result).toHaveProperty('refreshToken', 'mock-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'password',
          name: 'Existing',
        })
      ).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const bcrypt = require('bcrypt');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        password: 'hashed',
        avatarUrl: null,
        role: UserRole.client,
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toHaveProperty('accessToken', 'mock-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'password',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const bcrypt = require('bcrypt');
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed',
        role: UserRole.client,
      });

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return new tokens for valid refresh token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        token: 'old-refresh',
        expiresAt: new Date(Date.now() + 86400000),
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test',
          avatarUrl: null,
          role: UserRole.client,
        },
      });
      mockPrisma.refreshToken.delete.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.refresh('old-refresh');

      expect(result).toHaveProperty('accessToken', 'mock-token');
      expect(mockPrisma.refreshToken.delete).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        token: 'expired',
        expiresAt: new Date(Date.now() - 86400000),
        user: {},
      });

      await expect(service.refresh('expired')).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
