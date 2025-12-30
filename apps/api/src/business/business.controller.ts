import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
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
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BusinessContextGuard } from './guards/business-context.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { SetBusinessHoursDto } from './dto/business-hours.dto';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@ApiTags('businesses')
@Controller('v1/businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new business' })
  @ApiResponse({ status: 201, description: 'Business created' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateBusinessDto) {
    return this.businessService.create(user, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my businesses' })
  @ApiResponse({ status: 200, description: 'List of businesses' })
  findMy(@CurrentUser() user: JwtUser) {
    return this.businessService.findMyBusinesses(user);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get business by slug (public)' })
  @ApiResponse({ status: 200, description: 'Business profile' })
  findBySlug(@Param('slug') slug: string) {
    return this.businessService.findBySlug(slug);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, BusinessContextGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get business by ID' })
  @ApiResponse({ status: 200, description: 'Business details' })
  findById(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.businessService.findById(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, BusinessContextGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update business' })
  @ApiResponse({ status: 200, description: 'Updated business' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessService.update(id, user, dto);
  }

  @Post(':id/locations')
  @UseGuards(JwtAuthGuard, BusinessContextGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create location' })
  @ApiResponse({ status: 201, description: 'Location created' })
  createLocation(
    @Param('id') businessId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateLocationDto,
  ) {
    return this.businessService.createLocation(businessId, user, dto);
  }

  @Patch(':id/locations/:locId')
  @UseGuards(JwtAuthGuard, BusinessContextGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update location' })
  @ApiResponse({ status: 200, description: 'Updated location' })
  updateLocation(
    @Param('id') businessId: string,
    @Param('locId') locationId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.businessService.updateLocation(
      businessId,
      locationId,
      user,
      dto,
    );
  }

  @Put(':id/locations/:locId/hours')
  @UseGuards(JwtAuthGuard, BusinessContextGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set business hours for location' })
  @ApiResponse({ status: 200, description: 'Business hours updated' })
  setBusinessHours(
    @Param('id') businessId: string,
    @Param('locId') locationId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: SetBusinessHoursDto,
  ) {
    return this.businessService.setBusinessHours(
      businessId,
      locationId,
      user,
      dto.hours,
    );
  }
}
