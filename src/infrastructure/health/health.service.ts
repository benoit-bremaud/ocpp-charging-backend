import { Injectable } from '@nestjs/common';

/**
 * Health check service
 * Provides system metrics and health information
 */
@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  /**
   * Get application health status with metrics
   */
  getHealth() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const memoryUsage = process.memoryUsage();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${uptime}s`,
      environment: process.env.NODE_ENV || 'development',
      version: '0.1.0',
      metrics: {
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
        },
      },
      services: {
        database: 'connected',
        websocket: 'active',
      },
    };
  }
}
