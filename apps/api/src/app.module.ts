import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { ReviewModule } from './review/review.module';
import { ReportModule } from './report/report.module';
import { BusinessApplicationModule } from './business-application/business-application.module';
import { MeModule } from './me/me.module';
import { FavoriteModule } from './favorite/favorite.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    BusinessModule,
    ServiceModule,
    StaffModule,
    AvailabilityModule,
    BookingModule,
    PaymentModule,
    ClientModule,
    ReviewModule,
    ReportModule,
    BusinessApplicationModule,
    MeModule,
    FavoriteModule,
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
