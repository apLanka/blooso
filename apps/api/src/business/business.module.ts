import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BusinessContextGuard } from './guards/business-context.guard';

@Module({
  imports: [PrismaModule],
  controllers: [BusinessController],
  providers: [BusinessService, BusinessContextGuard],
  exports: [BusinessService],
})
export class BusinessModule {}
