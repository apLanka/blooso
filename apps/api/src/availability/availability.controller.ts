import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('availability')
@Controller('v1/availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get available time slots' })
  @ApiResponse({ status: 200, description: 'List of available slots' })
  getSlots(@Query() query: AvailabilityQueryDto) {
    return this.availabilityService.getAvailableSlots(
      query.businessId,
      query.serviceId,
      query.date,
      query.staffId,
      query.locationId,
    );
  }
}
