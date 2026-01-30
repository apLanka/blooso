import { IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class InPersonCheckoutDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: ['card', 'cash', 'transfer', 'other'] })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  tipAmount?: number;
}
