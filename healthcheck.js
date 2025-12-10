#!/usr/bin/env node

const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  method: 'GET',
  timeout: 2000,
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('[HEALTHCHECK] ✓ Service is healthy');
    process.exit(0);
  } else {
    console.log(`[HEALTHCHECK] ✗ Service returned status ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log(`[HEALTHCHECK] ✗ Connection failed: ${err.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('[HEALTHCHECK] ✗ Request timeout');
  req.destroy();
  process.exit(1);
});

req.end();
