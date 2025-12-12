import { check, group, sleep } from 'k6';

import http from 'k6/http';

export let options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],
  },
};

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIifQ.mock';
const BASE_URL = 'http://localhost:3001';

export default function () {
  group('Diagnostic - Get ChargePoints', function () {
    let response = http.get(BASE_URL + '/charge-points', {
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': 'application/json',
      },
    });

    check(response, {
      'status is 200': (r) => r.status === 200,
      'response body exists': (r) => r.body.length > 0,
    });

    // Always log for debugging
    console.log(`Status: ${response.status}, Body: ${response.body.substring(0, 150)}`);
  });

  sleep(1);
}
