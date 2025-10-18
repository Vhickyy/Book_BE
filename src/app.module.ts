import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { AuthorBookModule } from './author-book/author-book.module';
import { CacheModule, CacheOptions } from '@nestjs/cache-manager';
import { RefreshCacheService } from './redis/refresh-cache/refresh-cache.service';
import { RefreshCacheModule } from './redis/refresh-cache/refresh-cache.module';
import KeyvRedis, { Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { CloudinaryModule } from './services/cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { databaseConfig } from './config/db.config';
import { cacheConfig } from './config/cache.config';
@Module({
  imports: [
    CacheModule.registerAsync(cacheConfig),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(databaseConfig),
    UserModule,
    AuthModule,
    AuthorBookModule,
    RefreshCacheModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
