import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOverrideDto {
  @ApiProperty({ example: '2026-04-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  endTime: string;

  @ApiProperty({ description: 'false = time off, true = special availability' })
  @IsBoolean()
  isAvailable: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
