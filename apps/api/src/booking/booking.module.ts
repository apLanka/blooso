import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { AppointmentsController } from './appointments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AvailabilityModule } from '../availability/availability.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, AvailabilityModule, NotificationModule],
  controllers: [BookingController, AppointmentsController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
