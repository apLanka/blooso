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

export class StaffScheduleItemDto {
  @ApiProperty({ minimum: 0, maximum: 6 })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  endTime: string;

  @ApiProperty()
  @IsBoolean()
  isAvailable: boolean;
}

export class SetStaffScheduleDto {
  @ApiProperty({ type: [StaffScheduleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StaffScheduleItemDto)
  schedule: StaffScheduleItemDto[];
}
