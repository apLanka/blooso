import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BusinessContextGuard } from '../business/guards/business-context.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@ApiTags('reports')
@Controller('v1/businesses/:id/reports')
@UseGuards(JwtAuthGuard, BusinessContextGuard)
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard stats' })
  @ApiResponse({ status: 200, description: 'Dashboard data' })
  getDashboard(@Param('id') businessId: string, @CurrentUser() user: JwtUser) {
    return this.reportService.getDashboard(businessId, user);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue by period' })
  @ApiResponse({ status: 200, description: 'Revenue data' })
  getRevenue(
    @Param('id') businessId: string,
    @CurrentUser() user: JwtUser,
    @Query('period') period?: string,
  ) {
    return this.reportService.getRevenue(businessId, user, period ?? 'week');
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Appointments by period' })
  @ApiResponse({ status: 200, description: 'Appointment counts' })
  getAppointments(
    @Param('id') businessId: string,
    @CurrentUser() user: JwtUser,
    @Query('period') period?: string,
  ) {
    return this.reportService.getAppointments(
      businessId,
      user,
      period ?? 'week',
    );
  }

  @Get('clients')
  @ApiOperation({ summary: 'Client stats' })
  @ApiResponse({ status: 200, description: 'Top clients' })
  getClients(@Param('id') businessId: string, @CurrentUser() user: JwtUser) {
    return this.reportService.getClients(businessId, user);
  }

  @Get('top-services')
  @ApiOperation({ summary: 'Top services by bookings' })
  @ApiResponse({ status: 200, description: 'Top services' })
  getTopServices(
    @Param('id') businessId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.reportService.getTopServices(businessId, user);
  }
}
