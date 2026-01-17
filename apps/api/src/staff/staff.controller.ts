import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
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
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BusinessContextGuard } from '../business/guards/business-context.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { SetStaffScheduleDto } from './dto/staff-schedule.dto';
import { SetStaffServicesDto } from './dto/staff-services.dto';
import { AvailabilityService } from '../availability/availability.service';
import { CreateOverrideDto } from '../availability/dto/create-override.dto';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@ApiTags('staff')
@Controller('v1/businesses/:id/staff')
@UseGuards(JwtAuthGuard, BusinessContextGuard)
@ApiBearerAuth()
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add staff member' })
  @ApiResponse({ status: 201 })
  create(
    @Param('id') businessId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateStaffDto,
  ) {
    return this.staffService.create(businessId, user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List staff' })
  @ApiResponse({ status: 200 })
  findAll(@Param('id') businessId: string, @CurrentUser() user: JwtUser) {
    return this.staffService.findAll(businessId, user);
  }

  @Get(':staffId')
  @ApiOperation({ summary: 'Get staff detail' })
  @ApiResponse({ status: 200 })
  findOne(
    @Param('id') businessId: string,
    @Param('staffId') staffId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.staffService.findOne(businessId, staffId, user);
  }

  @Patch(':staffId')
  @ApiOperation({ summary: 'Update staff' })
  @ApiResponse({ status: 200 })
  update(
    @Param('id') businessId: string,
    @Param('staffId') staffId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.staffService.update(businessId, staffId, user, dto);
  }

  @Delete(':staffId')
  @ApiOperation({ summary: 'Remove staff (soft delete)' })
  @ApiResponse({ status: 200 })
  remove(
    @Param('id') businessId: string,
    @Param('staffId') staffId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.staffService.remove(businessId, staffId, user);
  }

  @Put(':staffId/services')
  @ApiOperation({ summary: 'Set staff service assignments' })
  @ApiResponse({ status: 200 })
  setServices(
    @Param('id') businessId: string,
    @Param('staffId') staffId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: SetStaffServicesDto,
  ) {
    return this.staffService.setServices(
      businessId,
      staffId,
      user,
      dto.serviceIds,
    );
  }

  @Put(':staffId/schedule')
  @ApiOperation({ summary: 'Set staff weekly schedule' })
  @ApiResponse({ status: 200 })
  setSchedule(
    @Param('id') businessId: string,
    @Param('staffId') staffId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: SetStaffScheduleDto,
  ) {
    return this.staffService.setSchedule(
      businessId,
      staffId,
      user,
      dto.schedule,
    );
  }

  @Post(':staffId/overrides')
  @ApiOperation({ summary: 'Create availability override (time off)' })
  @ApiResponse({ status: 201 })
  createOverride(
    @Param('id') businessId: string,
    @Param('staffId') staffId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateOverrideDto,
  ) {
    return this.availabilityService.createOverride(
      businessId,
      staffId,
      user,
      dto,
    );
  }
}
