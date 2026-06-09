import { Module } from '@nestjs/common';
import { BusinessApplicationService } from './business-application.service';
import {
  BusinessApplicationController,
  AdminApplicationController,
} from './business-application.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BusinessApplicationController, AdminApplicationController],
  providers: [BusinessApplicationService],
  exports: [BusinessApplicationService],
})
export class BusinessApplicationModule {}
