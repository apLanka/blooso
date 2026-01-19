import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  MinLength,
  IsEmail,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingSource } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty()
  @IsUUID()
  businessId: string;

  @ApiProperty()
  @IsUUID()
  locationId: string;

  @ApiProperty()
  @IsUUID()
  staffId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  serviceIds: string[];

  @ApiProperty({ example: '2026-04-15T09:00:00.000Z' })
  @IsString()
  startTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  guestName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  guestPhone?: string;

  @ApiPropertyOptional({
    enum: ['web', 'mobile', 'walk_in', 'phone', 'marketplace'],
  })
  @IsOptional()
  @IsEnum(['web', 'mobile', 'walk_in', 'phone', 'marketplace'])
  source?: BookingSource;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
