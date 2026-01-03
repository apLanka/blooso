import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('services')
@Controller('v1/businesses')
export class PublicServicesController {
  constructor(private readonly service: ServiceService) {}

  @Get('slug/:slug/services')
  @Public()
  @ApiOperation({ summary: 'Get active services by business slug (public)' })
  @ApiResponse({ status: 200 })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findServicesBySlug(slug);
  }
}
