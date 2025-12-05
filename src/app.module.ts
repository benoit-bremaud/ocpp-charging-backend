import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getTypeOrmConfig } from './infrastructure/database/typeorm.config';
import { ChargePoint } from './domain/entities/ChargePoint.entity';

// Infrastructure
import { ChargePointRepository } from './infrastructure/repositories/ChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from './infrastructure/tokens';

// Application
import { SelectChargePoint } from './application/use-cases/SelectChargePoint';

// Presentation
import { ChargePointController } from './presentation/controllers/ChargePointController';

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
  controllers: [AppController, ChargePointController],
  providers: [
    AppService,
    {
      provide: CHARGE_POINT_REPOSITORY_TOKEN,
      useClass: ChargePointRepository,
    },
    SelectChargePoint,
  ],
  exports: [CHARGE_POINT_REPOSITORY_TOKEN, SelectChargePoint],
})
export class AppModule {}
