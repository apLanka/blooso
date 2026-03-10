import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { PaymentService } from './payment.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { InPersonCheckoutDto } from './dto/in-person-checkout.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BusinessContextGuard } from '../business/guards/business-context.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@ApiTags('payments')
@Controller('v1/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe Checkout session' })
  @ApiResponse({ status: 200, description: 'Checkout URL' })
  createCheckout(@CurrentUser() user: JwtUser, @Body() dto: CreateCheckoutDto) {
    const successUrl =
      dto.successUrl ??
      process.env.STRIPE_SUCCESS_URL ??
      'http://localhost:3000/booking/success';
    const cancelUrl =
      dto.cancelUrl ??
      process.env.STRIPE_CANCEL_URL ??
      'http://localhost:3000/booking/cancel';
    return this.paymentService.createCheckoutSession(
      dto.appointmentId,
      successUrl,
      cancelUrl,
      user,
    );
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Stripe webhook (raw body)' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async webhook(
    @Req()
    req: {
      rawBody?: Buffer;
      headers: Record<string, string | string[] | undefined>;
    },
  ) {
    const signature = (req.headers['stripe-signature'] ?? '') as string;
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException(
        'Raw body required for webhook verification',
      );
    }
    const payload = Buffer.isBuffer(rawBody)
      ? rawBody
      : Buffer.from(String(rawBody));
    await this.paymentService.handleWebhook(payload, signature);
    return { received: true };
  }
}
