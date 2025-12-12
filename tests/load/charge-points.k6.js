import { check, group, sleep } from 'k6';

import http from 'k6/http';

export let options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '3m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.1'],
  },
};

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIifQ.mock';
const BASE_URL = 'http://localhost:3001';

export default function () {
  group('Get ChargePoints', function () {
    let response = http.get(BASE_URL + '/charge-points', {
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': 'application/json',
      },
    });

    check(response, {
      'status is 200': (r) => r.status === 200,
      'response time under 500ms': (r) => r.timings.duration < 500,
      'response is JSON': (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch (e) {
          return false;
        }
      },
    });

    if (response.status !== 200) {
      console.log(`❌ Error ${response.status}: ${response.body.substring(0, 100)}`);
    }
  });

  sleep(1);
}
