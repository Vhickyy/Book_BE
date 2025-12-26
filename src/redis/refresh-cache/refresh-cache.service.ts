import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';

@Injectable()
export class RefreshCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  async setRefreshTokenCache(): Promise<string> {
    // Generate strong refresh token here
    const refreshToken = 'random';
    const hashRefreshToken = await argon2.hash(refreshToken);
    const sessionId = randomUUID();
    await this.cacheManager.set(
      `refresh:${sessionId}`,
      hashRefreshToken,
      7 * 24 * 60 * 60,
    );
    return sessionId;
  }

  async setInCache({
    name,
    data,
    expiration,
  }: {
    name: string;
    data: any;
    expiration?: number;
  }): Promise<string> {
    return this.cacheManager.set(name, data, expiration);
  }

  async getCache(name: string) {
    const name2 = await this.cacheManager.get(name);
    console.log({ name2 });

    return this.cacheManager.get(name);
  }
}
