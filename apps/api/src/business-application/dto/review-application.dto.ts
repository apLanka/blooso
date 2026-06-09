import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewApplicationDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsString()
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectReason?: string;
}
