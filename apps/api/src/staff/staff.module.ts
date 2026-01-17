import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AvailabilityModule } from '../availability/availability.module';

@Module({
  imports: [PrismaModule, AvailabilityModule],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
