import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddTagDto {
  @ApiProperty({ example: 'VIP' })
  @IsString()
  @MinLength(1)
  tag: string;
}
