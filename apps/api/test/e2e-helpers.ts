import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';

/**
 * Applies the same global configuration as main.ts so e2e tests
 * behave like the real application.
 */
export function applyAppConfig(app: INestApplication): INestApplication {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  return app;
}
