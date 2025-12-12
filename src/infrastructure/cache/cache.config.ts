import type { CacheModuleOptions } from '@nestjs/cache-manager';

export const cacheConfig: CacheModuleOptions = {
  isGlobal: true,
  ttl: 300000,
};
