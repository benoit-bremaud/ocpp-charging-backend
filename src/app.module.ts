import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CHARGE_POINT_REPOSITORY_TOKEN } from './infrastructure/tokens';
import { ChargePoint } from './domain/entities/ChargePoint.entity';
// Presentation
import { ChargePointController } from './presentation/controllers/ChargePointController';
import { ChargePointGateway } from './infrastructure/websocket/ChargePointGateway';
// Infrastructure - Repositories & WebSocket
import { ChargePointRepository } from './infrastructure/repositories/ChargePointRepository';
import { ChargePointWebSocketService } from './infrastructure/websocket/ChargePointWebSocketService';
import { CreateChargePoint } from './application/use-cases/CreateChargePoint';
import { DeleteChargePoint } from './application/use-cases/DeleteChargePoint';
import { FindAllChargePoints } from './application/use-cases/FindAllChargePoints';
import { HandleAuthorize } from './application/use-cases/HandleAuthorize';
// Application - OCPP Handlers
import { HandleBootNotification } from './application/use-cases/HandleBootNotification';
import { HandleHeartbeat } from './application/use-cases/HandleHeartbeat';
import { HandleStatusNotification } from './application/use-cases/HandleStatusNotification';
import { HealthController } from './presentation/controllers/health.controller';
// Infrastructure - Health
import { HealthService } from './infrastructure/health/health.service';
import { Module } from '@nestjs/common';
// Application - OCPP Dispatcher
import { ProcessOcppMessage } from './application/use-cases/ProcessOcppMessage';
// Application - CRUD
import { SelectChargePoint } from './application/use-cases/SelectChargePoint';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpdateChargePoint } from './application/use-cases/UpdateChargePoint';
import { WinstonModule } from 'nest-winston';
import { getTypeOrmConfig } from './infrastructure/database/typeorm.config';
// Logger
import { winstonConfig } from './infrastructure/logger/winston.config';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Throttling (Rate Limiting) - Global protection
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute (in milliseconds)
        limit: 100, // Max 100 requests per minute per IP
      },
    ]),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
    }),
    TypeOrmModule.forFeature([ChargePoint]),
  ],
  controllers: [AppController, ChargePointController, HealthController],
  providers: [
    AppService,
    HealthService,
    // Global Throttling Guard (Rate Limiting)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: CHARGE_POINT_REPOSITORY_TOKEN,
      useClass: ChargePointRepository,
    },
    // Use-cases (CRUD)
    SelectChargePoint,
    CreateChargePoint,
    FindAllChargePoints,
    UpdateChargePoint,
    DeleteChargePoint,
    // Use-cases (OCPP Handlers)
    HandleBootNotification,
    HandleHeartbeat,
    HandleStatusNotification,
    HandleAuthorize,
    // Use-cases (OCPP Dispatcher - depends on handlers)
    ProcessOcppMessage,
    // WebSocket
    ChargePointGateway,
    ChargePointWebSocketService,
  ],
  exports: [
    CHARGE_POINT_REPOSITORY_TOKEN,
    SelectChargePoint,
    CreateChargePoint,
    FindAllChargePoints,
    UpdateChargePoint,
    DeleteChargePoint,
    ProcessOcppMessage,
    HandleBootNotification,
    HandleHeartbeat,
    HandleStatusNotification,
    HandleAuthorize,
    ChargePointWebSocketService,
  ],
})
export class AppModule {}
