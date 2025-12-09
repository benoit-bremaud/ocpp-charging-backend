import * as dotenv from 'dotenv';

import { ChargePoint } from '../../domain/entities/ChargePoint.entity';
import { DataSource } from 'typeorm';

dotenv.config();

/**
 * TypeORM CLI Configuration
 *
 * SEPARATE from getTypeOrmConfig (NestJS factory)
 * Needed for migrations via CLI:
 *   - npm run typeorm migration:generate
 *   - npm run typeorm migration:run
 *   - npm run typeorm migration:revert
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5434', 10),
  username: process.env.DATABASE_USER || 'ocpp_user',
  password: process.env.DATABASE_PASSWORD || 'ocpp_password',
  database: process.env.DATABASE_NAME || 'ocpp_db',

  // Entities: point to TypeORM entities
  entities: [ChargePoint],

  // Migrations: location of migration files
  migrations: ['src/infrastructure/database/migrations/*.ts'],

  // Subscribers: optional event listeners
  subscribers: [],

  // Options
  synchronize: false, // ⚠️  NEVER true in production!
  logging: false,
  dropSchema: false,
});
