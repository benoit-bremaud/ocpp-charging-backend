export const E2E_TEST_CONFIG = {
  database: {
    type: 'postgres',
    host: process.env.DATABASE_HOST_TEST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT_TEST || '5434', 10),
    username: process.env.DATABASE_USER_TEST || 'ocpp_test_user',
    password: process.env.DATABASE_PASSWORD_TEST || 'ocpp_test_password',
    database: process.env.DATABASE_NAME_TEST || 'ocpp_db_e2e',
    entities: ['src/**/*.entity.ts'],
    synchronize: true,
    dropSchema: true,
    logging: process.env.DATABASE_LOGGING === 'true',
  },
  server: {
    port: parseInt(process.env.APP_PORT_TEST || '3002', 10),
    host: '127.0.0.1',
  },
  websocket: {
    port: parseInt(process.env.WEBSOCKET_PORT_TEST || '8082', 10),
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
    dropSchemaAfterSuite: true,
    cleanEntitiesBetweenTests: true,
    entitiesToClean: ['ChargePoint', 'Connector', 'Transaction', 'Configuration'],
  },
};

export function getE2EDataSourceConfig() {
  return {
    ...E2E_TEST_CONFIG.database,
    type: 'postgres' as const,
    synchronize: true,
    dropSchema: true,
  };
}
