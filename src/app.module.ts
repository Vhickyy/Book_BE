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
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: 300,
        stores: [
          new Keyv({
            store: new CacheableMemory({ ttl: 60000 }),
          }),
          new KeyvRedis(configService.get('REDIS_URL')),
        ],
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configservice: ConfigService) => ({
        type: 'postgres',
        host: configservice.get('DB_HOST'),
        port: +configservice.get('DB_PORT'),
        entities: [User],
        username: configservice.get('POSTGRES_USER'),
        password: configservice.get('POSTGRES_PASSWORD'),
        database: configservice.get('POSTGRES_DB'),
        synchronize: true,
      }),
    }),
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
