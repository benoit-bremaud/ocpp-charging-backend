import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

/**
 * E2E Test Setup
 *
 * Initializes and closes the application for E2E tests
 * Handles database connection and cleanup
 */

export async function initializeE2EApp(): Promise<INestApplication> {
  try {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();

    console.log('✅ E2E App initialized successfully');
    return app;
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
    // Close the HTTP server explicitly
    const httpServer = app.getHttpServer();
    if (httpServer && httpServer.listening) {
      await new Promise<void>((resolve, reject) => {
        httpServer.close((err: unknown) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Then close the NestJS app
    await app.close();

    // Give time for cleanup
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log('✅ E2E App closed successfully');
  } catch (error) {
    console.error('❌ Error closing E2E app:', error);
    throw error;
  }
}
