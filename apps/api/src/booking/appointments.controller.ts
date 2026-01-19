import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
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

@ApiTags('appointments')
@Controller('v1/businesses/:id/appointments')
@UseGuards(JwtAuthGuard, BusinessContextGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @ApiOperation({ summary: 'List appointments' })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  findAll(
    @Param('id') businessId: string,
    @CurrentUser() user: JwtUser,
    @Query('date') date?: string,
    @Query('staffId') staffId?: string,
    @Query('status') status?: string,
  ) {
    return this.bookingService.findAppointments(businessId, user, {
      date,
      staffId,
      status,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create appointment (walk-in)' })
  @ApiResponse({ status: 201, description: 'Appointment created' })
  create(
    @Param('id') businessId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: Omit<CreateBookingDto, 'businessId' | 'source'>,
  ) {
    return this.bookingService.createBooking(
      { ...dto, businessId, source: 'walk_in' } as CreateBookingDto,
      user,
    );
  }

  @Get(':appointmentId')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment details' })
  findOne(
    @Param('id') businessId: string,
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.bookingService.findOneAppointment(
      businessId,
      appointmentId,
      user,
    );
  }

  @Patch(':appointmentId')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated' })
  update(
    @Param('id') businessId: string,
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.bookingService.updateAppointment(
      businessId,
      appointmentId,
      user,
      dto,
    );
  }

  @Post(':appointmentId/cancel')
  @ApiOperation({ summary: 'Cancel appointment' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled' })
  cancel(
    @Param('id') businessId: string,
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CancelAppointmentDto,
  ) {
    return this.bookingService.cancelAppointment(
      businessId,
      appointmentId,
      user,
      dto.reason,
    );
  }
}
