jest.setTimeout(30000);

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: (msg) => {
    if (!msg.includes('ExperimentalWarning')) {
      process.stderr.write(`WARN: ${msg}\n`);
    }
  },
  error: (msg) => {
    process.stderr.write(`ERROR: ${msg}\n`);
  },
};

process.env.NODE_ENV = 'test';
process.env.DATABASE_NAME = 'ocpp_db_e2e';
