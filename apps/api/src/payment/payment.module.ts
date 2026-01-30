import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { AppointmentPaymentsController } from './appointment-payments.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [PaymentController, AppointmentPaymentsController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
