import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard-stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get('businesses')
  getBusinesses() {
    return this.adminService.getBusinesses();
  }
}
