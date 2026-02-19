import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';

interface JwtUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

@ApiTags('reviews')
@Controller('v1/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Submit review (client)' })
  @ApiResponse({ status: 201, description: 'Review created' })
  create(@Body() dto: CreateReviewDto) {
    return this.reviewService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List reviews by business (public)' })
  @ApiResponse({ status: 200, description: 'Paginated reviews' })
  findByBusiness(
    @Query('businessId') businessId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('rating') rating?: string,
  ) {
    if (!businessId) throw new BadRequestException('businessId required');
    return this.reviewService.findByBusiness(businessId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      rating: rating ? parseInt(rating, 10) : undefined,
    });
  }

  @Patch(':id/reply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reply to review (business owner)' })
  @ApiResponse({ status: 200, description: 'Reply added' })
  reply(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: ReplyReviewDto,
  ) {
    return this.reviewService.reply(id, dto.reply, user);
  }

  @Get('business/:businessId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List reviews for dashboard (auth)' })
  @ApiResponse({ status: 200, description: 'Reviews list' })
  findByBusinessForDashboard(
    @Param('businessId') businessId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.reviewService.findByBusinessForDashboard(businessId, user);
  }
}
