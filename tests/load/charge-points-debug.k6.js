import { check, group, sleep } from 'k6';

import http from 'k6/http';

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],
  },
};

const BASE_URL = 'http://localhost:3001';

export default function () {
  group('Diagnostic - Get ChargePoints', function () {
    let response = http.get(`${BASE_URL}/charge-points`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // LOG DETAILED STATUS
    if (response.status !== 200) {
      console.log(`❌ ERROR: Status ${response.status}`);
      console.log(`   Body: ${response.body.substring(0, 200)}`);
    } else {
      console.log(`✅ OK: Status 200`);
    }

    check(response, {
      'status is 200': (r) => r.status === 200,
      'response body exists': (r) => r.body.length > 0,
    });
  });
  sleep(1);
}
