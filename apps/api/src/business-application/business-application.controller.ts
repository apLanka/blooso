import {
  Controller,
  Get,
  Post,
  Patch,
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
import { BusinessApplicationService } from './business-application.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { UserRole } from '@prisma/client';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@ApiTags('business-applications')
@Controller('v1/business-applications')
export class BusinessApplicationController {
  constructor(
    private readonly applicationService: BusinessApplicationService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a business application' })
  @ApiResponse({ status: 201, description: 'Application submitted' })
  submit(@CurrentUser() user: JwtUser, @Body() dto: CreateApplicationDto) {
    return this.applicationService.submit(user.id, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my latest application' })
  @ApiResponse({ status: 200, description: 'Application details' })
  getMyApplication(@CurrentUser() user: JwtUser) {
    return this.applicationService.getMyApplication(user.id);
  }
}

@ApiTags('admin')
@Controller('v1/admin/applications')
export class AdminApplicationController {
  constructor(
    private readonly applicationService: BusinessApplicationService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all applications (admin only)' })
  @ApiResponse({ status: 200, description: 'List of applications' })
  getAll() {
    return this.applicationService.getAllApplications();
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List pending applications (admin only)' })
  @ApiResponse({ status: 200, description: 'List of pending applications' })
  getPending() {
    return this.applicationService.getAllPending();
  }

  @Patch(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject application (admin only)' })
  @ApiResponse({ status: 200, description: 'Application reviewed' })
  review(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: ReviewApplicationDto,
  ) {
    return this.applicationService.review(id, user, dto);
  }
}
