import { IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AvailabilityQueryDto {
  @ApiProperty()
  @IsUUID()
  businessId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  staffId?: string;

  @ApiProperty()
  @IsUUID()
  serviceId: string;

  @ApiProperty({ example: '2026-04-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  locationId?: string;
}
