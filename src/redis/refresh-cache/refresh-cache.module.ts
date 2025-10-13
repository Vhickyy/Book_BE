import { Module } from '@nestjs/common';
import { RefreshCacheService } from './refresh-cache.service';

@Module({
  providers: [RefreshCacheService],
  exports: [RefreshCacheService],
})
export class RefreshCacheModule {}
