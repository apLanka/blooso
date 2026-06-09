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

export class CreateApplicationDto {
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

  @ApiProperty({ example: '123 Salon Street' })
  @IsString()
  @MaxLength(200)
  address: string;

  @ApiPropertyOptional({ example: 'New York' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ example: 'USA' })
  @IsString()
  @MaxLength(100)
  country: string;

  @ApiPropertyOptional({ example: '+1 555 123 4567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
