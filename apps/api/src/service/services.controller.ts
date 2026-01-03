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
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@ApiTags('services')
@Controller('v1/businesses/:id/services')
@UseGuards(JwtAuthGuard, BusinessContextGuard)
@ApiBearerAuth()
export class ServicesController {
  constructor(private readonly service: ServiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create service' })
  @ApiResponse({ status: 201 })
  create(
    @Param('id') businessId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateServiceDto,
  ) {
    return this.service.createService(businessId, user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List services' })
  @ApiResponse({ status: 200 })
  findAll(@Param('id') businessId: string, @CurrentUser() user: JwtUser) {
    return this.service.findServices(businessId, user);
  }

  @Patch(':serviceId')
  @ApiOperation({ summary: 'Update service (includes is_active toggle)' })
  @ApiResponse({ status: 200 })
  update(
    @Param('id') businessId: string,
    @Param('serviceId') serviceId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.service.updateService(businessId, serviceId, user, dto);
  }

  @Delete(':serviceId')
  @ApiOperation({ summary: 'Delete service' })
  @ApiResponse({ status: 200 })
  delete(
    @Param('id') businessId: string,
    @Param('serviceId') serviceId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.deleteService(businessId, serviceId, user);
  }
}
