import {
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
  Matches,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BusinessHoursItemDto {
  @ApiProperty({ minimum: 0, maximum: 6 })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Format must be HH:mm' })
  openTime: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Format must be HH:mm' })
  closeTime: string;

  @ApiProperty()
  @IsBoolean()
  isClosed: boolean;
}

export class SetBusinessHoursDto {
  @ApiProperty({ type: [BusinessHoursItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessHoursItemDto)
  hours: BusinessHoursItemDto[];
}
