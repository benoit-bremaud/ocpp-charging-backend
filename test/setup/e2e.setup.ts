import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '@app/app.module';
import { E2E_TEST_CONFIG, getE2EDataSourceConfig } from '../config/e2e-test.config';

let cachedApp: INestApplication | null = null;

export async function initializeE2EApp(): Promise<INestApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...getE2EDataSourceConfig(),
          host: E2E_TEST_CONFIG.database.host,
          port: E2E_TEST_CONFIG.database.port,
          username: E2E_TEST_CONFIG.database.username,
          password: E2E_TEST_CONFIG.database.password,
          database: E2E_TEST_CONFIG.database.database,
        }),
        AppModule,
      ],
    }).compile();

    cachedApp = moduleFixture.createNestApplication();

    await cachedApp.listen(
      E2E_TEST_CONFIG.server.port,
      E2E_TEST_CONFIG.server.host
    );

    console.log(
      `✅ E2E App initialized on http://${E2E_TEST_CONFIG.server.host}:${E2E_TEST_CONFIG.server.port}`
    );

    return cachedApp;
  } catch (error) {
    console.error('❌ Failed to initialize E2E app:', error);
    throw error;
  }
}

export async function closeE2EApp(app: INestApplication): Promise<void> {
  if (!app) {
    return;
  }

  try {
    await app.close();
    console.log('✅ E2E App closed successfully');
  } catch (error) {
    console.error('❌ Error closing E2E app:', error);
    throw error;
  }
}

export async function globalE2ESetup(): Promise<void> {
  console.log('\n🚀 Starting E2E Test Suite Setup...');

  try {
    await initializeE2EApp();
    console.log('✅ Global setup complete');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    process.exit(1);
  }
}

export async function globalE2ETeardown(): Promise<void> {
  console.log('\n🛑 Tearing down E2E Test Suite...');

  try {
    if (cachedApp) {
      await closeE2EApp(cachedApp);
      cachedApp = null;
    }
    console.log('✅ Global teardown complete');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    process.exit(1);
  }
}

export function getE2EApp(): INestApplication | null {
  return cachedApp;
}
