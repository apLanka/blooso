import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyReviewDto {
  @ApiProperty()
  @IsString()
  reply: string;
}
