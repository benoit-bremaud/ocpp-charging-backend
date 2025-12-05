import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getTypeOrmConfig } from './infrastructure/database/typeorm.config';
import { ChargePoint } from './domain/entities/ChargePoint.entity';

// Domain
import { IChargePointRepository } from './domain/repositories/IChargePointRepository';

// Infrastructure
import { ChargePointRepository } from './infrastructure/repositories/ChargePointRepository';

/**
 * Symbolic token for IChargePointRepository.
 * Enables explicit binding of interface to implementation.
 *
 * SOLID: DIP - depends on abstraction, not concrete class.
 */
export const CHARGE_POINT_REPOSITORY_TOKEN = 'IChargePointRepository';

/**
 * App Module
 * Root module of the NestJS application
 *
 * CLEAN: Imports all layers (Domain, Application, Infrastructure, Presentation)
 * SOLID: Dependencies injected via NestJS DI with explicit tokens
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
  providers: [
    AppService,
    {
      provide: CHARGE_POINT_REPOSITORY_TOKEN,
      useClass: ChargePointRepository,
    },
  ],
  exports: [CHARGE_POINT_REPOSITORY_TOKEN],
})
export class AppModule {}
