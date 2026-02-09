import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { ServiceModule } from './service/service.module';
import { StaffModule } from './staff/staff.module';
import { AvailabilityModule } from './availability/availability.module';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';
import { ClientModule } from './client/client.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: process.env.REDIS_URL
          ? { url: process.env.REDIS_URL }
          : { host: 'localhost', port: 6379 },
      }),
    }),
    BullModule.registerQueue({ name: 'notifications' }, { name: 'reminders' }),
    PrismaModule,
    AuthModule,
    BusinessModule,
    ServiceModule,
    StaffModule,
    AvailabilityModule,
    BookingModule,
    PaymentModule,
    ClientModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
