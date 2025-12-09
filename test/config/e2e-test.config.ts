/**
 * E2E Test Configuration
 *
 * Loads configuration from environment variables defined in .env.test
 * This ensures E2E tests use isolated configuration.
 *
 * @module test/config/e2e-test.config
 */

export const E2E_TEST_CONFIG = {
  /**
   * Database configuration for E2E tests
   * Loaded from .env.test via ConfigModule
   */
  database: {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5434', 10),
    username: process.env.DATABASE_USER || 'ocpp_user',
    password: process.env.DATABASE_PASSWORD || 'ocpp_password',
    database: process.env.DATABASE_NAME || 'ocpp_db_e2e',
    entities: ['src/**/*.entity.ts'],
    synchronize: true,
    dropSchema: false,
    logging: process.env.DATABASE_LOGGING === 'true',
  },

  server: {
    port: parseInt(process.env.APP_PORT || '3002', 10),
    host: '127.0.0.1',
  },

  websocket: {
    port: parseInt(process.env.WEBSOCKET_PORT || '8082', 10),
    host: '127.0.0.1',
  },

  timeouts: {
    httpRequest: 10000,
    websocketConnect: 5000,
    setup: 30000,
    teardown: 10000,
  },

  execution: {
    retryAttempts: 1,
    retryDelay: 1000,
    skipSlowTests: process.env.CI === 'true',
  },

  cleanup: {
    dropSchemaAfterSuite: false,
    cleanEntitiesBetweenTests: true,
    entitiesToClean: ['ChargePoint', 'Connector', 'Transaction', 'Configuration'],
  },
};

export function getE2EDataSourceConfig() {
  return {
    ...E2E_TEST_CONFIG.database,
    type: 'postgres' as const,
    synchronize: true,
    dropSchema: false,
  };
}
