import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getTypeOrmConfig } from './infrastructure/database/typeorm.config';
import { ChargePoint } from './domain/entities/ChargePoint.entity';

/**
 * App Module
 * Root module of the NestJS application
 *
 * CLEAN: Imports all layers (Domain, Application, Infrastructure, Presentation)
 * SOLID: Dependencies injected via NestJS DI
 */
@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Setup TypeORM with dynamic configuration
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
    }),

    // Register entities for injection
    TypeOrmModule.forFeature([ChargePoint]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
