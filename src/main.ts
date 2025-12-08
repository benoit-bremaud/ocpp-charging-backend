import { AppModule } from './app.module';
import { HttpLoggingInterceptor } from './infrastructure/logger/http-logging.interceptor';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { createSwaggerConfig } from './swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use Winston as the main logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Global Interceptors
  app.useGlobalInterceptors(new HttpLoggingInterceptor());

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
  await app.listen(process.env.PORT ?? 3000);

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Swagger UI available at: ${await app.getUrl()}/api/docs`);
}
bootstrap();
