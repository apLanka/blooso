import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  Min,
  Max,
  MaxLength,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const STAFF_ROLES = [
  'owner',
  'manager',
  'senior_staff',
  'staff',
  'junior_staff',
];

export class CreateStaffDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: STAFF_ROLES })
  @IsString()
  @IsIn(STAFF_ROLES)
  role: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string | null;
}
