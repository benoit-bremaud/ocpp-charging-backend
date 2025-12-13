#!/bin/bash
set -e

echo "Starting Load Testing Phase 10.5..."
echo ""

echo "Checking server status..."
curl -s http://localhost:3001/health > /dev/null && echo "Server is running" || {
  echo "Server not running. Start with: npm run start:dev"
  exit 1
}

echo ""
echo "Running k6 load test..."
k6 run tests/load/charge-points.k6.js

echo ""
echo "Load test completed"
