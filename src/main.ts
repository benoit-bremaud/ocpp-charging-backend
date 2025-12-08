import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { createSwaggerConfig } from './swagger.config';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const swaggerConfig = createSwaggerConfig();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'OCPP Backend API Docs',
  });

  // Export OpenAPI spec
  fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));

  const port = 3001;
  const host = '0.0.0.0';
  await app.listen(port, host);

  const baseUrl = `http://localhost:${port}`;
  console.log(`Application is running on: ${baseUrl}`);
  console.log(`Swagger UI is available at: ${baseUrl}/api/docs`);
  console.log(`OpenAPI JSON is available at: ${baseUrl}/api/docs-json`);
}

bootstrap();
