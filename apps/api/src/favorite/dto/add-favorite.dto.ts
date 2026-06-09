import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddFavoriteDto {
  @ApiProperty({ example: 'business-id-123' })
  @IsString()
  businessId: string;
}
