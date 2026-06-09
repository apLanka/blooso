import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FavoriteService } from './favorite.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@ApiTags('favorites')
@Controller('v1/me/favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiResponse({ status: 200, description: 'List of favorite businesses' })
  findAll(@CurrentUser() user: JwtUser) {
    return this.favoriteService.findAll(user);
  }

  @Post()
  @ApiOperation({ summary: 'Add business to favorites' })
  @ApiResponse({ status: 201, description: 'Business added to favorites' })
  add(@CurrentUser() user: JwtUser, @Body() dto: AddFavoriteDto) {
    return this.favoriteService.add(user, dto.businessId);
  }

  @Delete(':businessId')
  @ApiOperation({ summary: 'Remove business from favorites' })
  @ApiResponse({ status: 200, description: 'Business removed from favorites' })
  remove(
    @CurrentUser() user: JwtUser,
    @Param('businessId') businessId: string,
  ) {
    return this.favoriteService.remove(user, businessId);
  }
}
