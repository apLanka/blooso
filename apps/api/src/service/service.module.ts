import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceCategoriesController } from './service-categories.controller';
import { ServicesController } from './services.controller';
import { PublicServicesController } from './public-services.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    ServiceCategoriesController,
    ServicesController,
    PublicServicesController,
  ],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
