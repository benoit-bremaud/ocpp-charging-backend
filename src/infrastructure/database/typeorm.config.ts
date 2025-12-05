import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ChargePoint } from '../../domain/entities/ChargePoint.entity';

/**
 * TypeORM Configuration Factory
 * Provides database connection configuration
 *
 * CLEAN: Infrastructure layer - database adapter
 * SOLID: Factory pattern + Dependency Injection
 */
export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get<string>('APP_ENV') === 'production';

  return {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST', 'localhost'),
    port: configService.get<number>('DATABASE_PORT', 5434),
    username: configService.get<string>('DATABASE_USER', 'ocpp_user'),
    password: configService.get<string>('DATABASE_PASSWORD', 'ocpp_password'),
    database: configService.get<string>('DATABASE_NAME', 'ocpp_db'),
    
    // ✅ CRITICAL: Import entity directly (not glob pattern)
    entities: [ChargePoint],
    
    synchronize: !isProduction,
    logging: !isProduction,
    dropSchema: false,
  };
};
