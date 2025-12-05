import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DATABASE_HOST', 'localhost'),
  port: configService.get('DATABASE_PORT', 5434),
  username: configService.get('DATABASE_USER', 'ocpp_user'),
  password: configService.get('DATABASE_PASSWORD', 'ocpp_password_secure'),
  database: configService.get('DATABASE_NAME', 'ocpp_db'),
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
  logging: true,
  dropSchema: false,
});
