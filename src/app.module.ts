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
import { CreateChargePoint } from './application/use-cases/CreateChargePoint';
import { FindAllChargePoints } from './application/use-cases/FindAllChargePoints';
import { UpdateChargePoint } from './application/use-cases/UpdateChargePoint';
import { DeleteChargePoint } from './application/use-cases/DeleteChargePoint';

// Presentation
import { ChargePointController } from './presentation/controllers/ChargePointController';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getTypeOrmConfig(configService),
    }),
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
    CreateChargePoint,
    FindAllChargePoints,
    UpdateChargePoint,
    DeleteChargePoint,
  ],
  exports: [
    CHARGE_POINT_REPOSITORY_TOKEN,
    SelectChargePoint,
    CreateChargePoint,
    FindAllChargePoints,
    UpdateChargePoint,
    DeleteChargePoint,
  ],
})
export class AppModule {}
