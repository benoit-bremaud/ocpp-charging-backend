import { Injectable } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService {
  private httpRequestDuration: Histogram;
  private httpRequestTotal: Counter;

  constructor() {
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in ms',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 5, 15, 50, 100, 500],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });
  }

  recordRequestDuration(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ): void {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);

    this.httpRequestTotal
      .labels(method, route, statusCode.toString())
      .inc();
  }

  async getMetrics(): Promise<string> {
    return await register.metrics();
  }
}
