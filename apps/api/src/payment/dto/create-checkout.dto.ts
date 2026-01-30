import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCheckoutDto {
  @ApiProperty()
  @IsUUID()
  appointmentId: string;

  @ApiPropertyOptional({ description: 'Override success URL' })
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiPropertyOptional({ description: 'Override cancel URL' })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
