import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { applyAppConfig } from './e2e-helpers';

/**
 * API E2E tests. Requires DATABASE_URL to point to a test database with migrations applied.
 * Run: npm run db:migrate (or use a separate test DB) before npm run test:e2e
 */
describe('API (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let refreshToken: string;
  const uniqueEmail = `test-${Date.now()}@example.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ rawBody: true });
    applyAppConfig(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('GET / returns 200', () =>
      request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect({ status: 'ok' }));
  });

  describe('Auth', () => {
    it('POST /v1/auth/register - rejects invalid body', () =>
      request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({})
        .expect(400));

    it('POST /v1/auth/register - rejects short password', () =>
      request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ email: 'a@b.com', password: 'short', name: 'Test' })
        .expect(400));

    it('POST /v1/auth/register - creates user', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'SecurePass123',
          name: 'E2E Test User',
        })
        .expect(201);

      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toMatchObject({
        email: uniqueEmail,
        name: 'E2E Test User',
      });
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('expiresIn');

      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it('POST /v1/auth/register - rejects duplicate email', () =>
      request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'SecurePass123',
          name: 'Duplicate',
        })
        .expect(409));

    it('POST /v1/auth/login - rejects invalid credentials', () =>
      request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'wrong' })
        .expect(401));

    it('POST /v1/auth/login - returns tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: uniqueEmail, password: 'SecurePass123' })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it('GET /v1/auth/me - rejects without token', () =>
      request(app.getHttpServer()).get('/v1/auth/me').expect(401));

    it('GET /v1/auth/me - returns user with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        email: uniqueEmail,
        name: 'E2E Test User',
      });
    });

    it('POST /v1/auth/refresh - returns new tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it('POST /v1/auth/logout - succeeds', () =>
      request(app.getHttpServer())
        .post('/v1/auth/logout')
        .send({ refreshToken })
        .expect(200));
  });

  describe('Businesses (public)', () => {
    it('GET /v1/businesses/search - returns paginated list', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/businesses/search')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('limit');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /v1/businesses/search - accepts query params', () =>
      request(app.getHttpServer())
        .get('/v1/businesses/search?q=salon&category=salon&page=1&limit=10')
        .expect(200));

    it('GET /v1/businesses/slug/:slug - returns 404 for unknown slug', () =>
      request(app.getHttpServer())
        .get('/v1/businesses/slug/nonexistent-slug-12345')
        .expect(404));
  });

  describe('Businesses (protected)', () => {
    beforeAll(async () => {
      if (!accessToken) {
        const res = await request(app.getHttpServer())
          .post('/v1/auth/login')
          .send({ email: uniqueEmail, password: 'SecurePass123' });
        if (res.status === 200) accessToken = res.body.accessToken;
      }
    });

    it('GET /v1/businesses - requires auth', () =>
      request(app.getHttpServer()).get('/v1/businesses').expect(401));

    it('GET /v1/businesses - returns my businesses with token', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/businesses')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /v1/businesses - creates business', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/businesses')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'E2E Test Salon', category: 'salon' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toMatchObject({
        name: 'E2E Test Salon',
        category: 'salon',
      });
    });
  });

  describe('Availability (public)', () => {
    it('GET /v1/availability - rejects without required params', () =>
      request(app.getHttpServer()).get('/v1/availability').expect(400));

    it('GET /v1/availability - rejects invalid UUIDs', () =>
      request(app.getHttpServer())
        .get(
          '/v1/availability?businessId=invalid&serviceId=invalid&date=2026-04-15',
        )
        .expect(400));
  });

  describe('Bookings (protected)', () => {
    it('POST /v1/bookings - requires auth', () =>
      request(app.getHttpServer())
        .post('/v1/bookings')
        .send({
          businessId: '00000000-0000-0000-0000-000000000001',
          locationId: '00000000-0000-0000-0000-000000000001',
          staffId: '00000000-0000-0000-0000-000000000001',
          serviceIds: ['00000000-0000-0000-0000-000000000001'],
          startTime: '2026-04-15T09:00:00.000Z',
        })
        .expect(401));
  });

  describe('Payments', () => {
    it('POST /v1/payments/checkout - requires auth', () =>
      request(app.getHttpServer())
        .post('/v1/payments/checkout')
        .send({ appointmentId: '00000000-0000-0000-0000-000000000001' })
        .expect(401));

    it('POST /v1/payments/webhook - returns 400 without Stripe signature', () =>
      request(app.getHttpServer())
        .post('/v1/payments/webhook')
        .set('content-type', 'application/json')
        .send({})
        .expect(400));
  });

  describe('Reviews (public)', () => {
    it('GET /v1/reviews - requires businessId', () =>
      request(app.getHttpServer()).get('/v1/reviews').expect(400));

    it('GET /v1/reviews - returns list with valid businessId', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/reviews?businessId=00000000-0000-0000-0000-000000000001')
        .expect(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
