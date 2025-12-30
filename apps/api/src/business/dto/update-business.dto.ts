import { IsString, IsOptional, IsIn, MaxLength, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const BUSINESS_CATEGORIES = [
  'salon',
  'barbershop',
  'spa',
  'wellness',
  'nails',
  'tattoo',
  'massage',
  'hair',
  'beauty',
  'medspa',
  'other',
] as const;

export class UpdateBusinessDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ enum: BUSINESS_CATEGORIES })
  @IsOptional()
  @IsString()
  @IsIn([...BUSINESS_CATEGORIES])
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  settings?: Record<string, unknown>;
}
