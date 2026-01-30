import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { InPersonCheckoutDto } from './dto/in-person-checkout.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BusinessContextGuard } from '../business/guards/business-context.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@ApiTags('appointment-payments')
@Controller('v1/businesses/:id/appointments/:appointmentId')
@UseGuards(JwtAuthGuard, BusinessContextGuard)
@ApiBearerAuth()
export class AppointmentPaymentsController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Record in-person payment (cash/card)' })
  @ApiResponse({ status: 201, description: 'Payment recorded' })
  inPersonCheckout(
    @Param('id') businessId: string,
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: InPersonCheckoutDto,
  ) {
    return this.paymentService.recordInPersonPayment(
      businessId,
      appointmentId,
      user,
      dto,
    );
  }

  @Get('payments')
  @ApiOperation({ summary: 'List payments for appointment' })
  @ApiResponse({ status: 200, description: 'Payment list' })
  getPayments(
    @Param('id') businessId: string,
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.paymentService.getPaymentsForAppointment(appointmentId, user);
  }
}
