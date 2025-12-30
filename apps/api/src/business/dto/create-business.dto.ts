import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

export class CreateBusinessDto {
  @ApiProperty({ example: 'Blooso Salon' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: BUSINESS_CATEGORIES })
  @IsString()
  @IsIn([...BUSINESS_CATEGORIES])
  category: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
