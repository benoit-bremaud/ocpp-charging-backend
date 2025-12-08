import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getTypeOrmConfig } from './infrastructure/database/typeorm.config';
import { ChargePoint } from './domain/entities/ChargePoint.entity';

// Logger
import { winstonConfig } from './infrastructure/logger/winston.config';

// Infrastructure - Health
import { HealthService } from './infrastructure/health/health.service';

// Infrastructure - Repositories & WebSocket
import { ChargePointRepository } from './infrastructure/repositories/ChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from './infrastructure/tokens';
import { ChargePointGateway } from './infrastructure/websocket/ChargePointGateway';
import { ChargePointWebSocketService } from './infrastructure/websocket/ChargePointWebSocketService';

// Application - CRUD
import { SelectChargePoint } from './application/use-cases/SelectChargePoint';
import { CreateChargePoint } from './application/use-cases/CreateChargePoint';
import { FindAllChargePoints } from './application/use-cases/FindAllChargePoints';
import { UpdateChargePoint } from './application/use-cases/UpdateChargePoint';
import { DeleteChargePoint } from './application/use-cases/DeleteChargePoint';

// Application - OCPP Dispatcher
import { ProcessOcppMessage } from './application/use-cases/ProcessOcppMessage';

// Application - OCPP Handlers
import { HandleBootNotification } from './application/use-cases/HandleBootNotification';
import { HandleHeartbeat } from './application/use-cases/HandleHeartbeat';
import { HandleStatusNotification } from './application/use-cases/HandleStatusNotification';
import { HandleAuthorize } from './application/use-cases/HandleAuthorize';

// Presentation
import { ChargePointController } from './presentation/controllers/ChargePointController';
import { HealthController } from './presentation/controllers/health.controller';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
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
