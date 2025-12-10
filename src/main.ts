import { AppModule } from './app.module';
import { HttpLoggingInterceptor } from './infrastructure/logger/http-logging.interceptor';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { createSwaggerConfig } from './swagger.config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use Winston as the main logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Security: Helmet middleware (protects HTTP headers)
  app.use(helmet());

  // Global Interceptors
  app.useGlobalInterceptors(new HttpLoggingInterceptor());

  // Global Validation Pipe (Security Hardening)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error if extra properties present
      transform: true, // Automatically transform payloads to DTO instances
      disableErrorMessages: process.env.NODE_ENV === 'production', // Hide error details in prod
    }),
  );

  // Swagger Setup (Centralized Config)
  const swaggerConfig = createSwaggerConfig();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Setup Swagger UI with custom options
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      filter: true,
      showRequestHeaders: true,
      persistAuthorization: true,
    },
  });

  // Start Server
  // await app.listen(process.env.PORT ?? 3000);
  await app.listen(parseInt(process.env.API_PORT || process.env.PORT || '3001', 10));

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Swagger UI available at: ${await app.getUrl()}/api/docs`);
}
bootstrap();
