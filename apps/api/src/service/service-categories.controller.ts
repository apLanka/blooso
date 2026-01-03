import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BusinessContextGuard } from '../business/guards/business-context.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@ApiTags('service-categories')
@Controller('v1/businesses/:id/service-categories')
@UseGuards(JwtAuthGuard, BusinessContextGuard)
@ApiBearerAuth()
export class ServiceCategoriesController {
  constructor(private readonly service: ServiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({ status: 201 })
  create(
    @Param('id') businessId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.service.createCategory(businessId, user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List categories with services' })
  @ApiResponse({ status: 200 })
  findAll(@Param('id') businessId: string, @CurrentUser() user: JwtUser) {
    return this.service.findCategories(businessId, user);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder categories' })
  @ApiResponse({ status: 200 })
  reorder(
    @Param('id') businessId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: ReorderCategoriesDto,
  ) {
    return this.service.reorderCategories(businessId, user, dto.items);
  }

  @Patch(':categoryId')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200 })
  update(
    @Param('id') businessId: string,
    @Param('categoryId') categoryId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.service.updateCategory(businessId, categoryId, user, dto);
  }

  @Delete(':categoryId')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200 })
  delete(
    @Param('id') businessId: string,
    @Param('categoryId') categoryId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.deleteCategory(businessId, categoryId, user);
  }
}
