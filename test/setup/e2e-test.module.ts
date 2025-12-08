import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '@app/app.module';
import { E2E_TEST_CONFIG } from '../config/e2e-test.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: E2E_TEST_CONFIG.database.host,
        port: E2E_TEST_CONFIG.database.port,
        username: E2E_TEST_CONFIG.database.username,
        password: E2E_TEST_CONFIG.database.password,
        database: E2E_TEST_CONFIG.database.database,
        entities: ['src/**/*.entity.ts'],
        synchronize: true,
        dropSchema: true,
        logging: false,
      }),
    }),

    AppModule,
  ],
})
export class E2ETestModule {}
