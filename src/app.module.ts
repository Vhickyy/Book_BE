import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorBookModule } from './author-book/author-book.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RefreshCacheModule } from './redis/refresh-cache/refresh-cache.module';
import { CloudinaryModule } from './services/cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { databaseConfig } from './config/db.config';
import { cacheConfig } from './config/cache.config';
import { TokenModule } from './services/token/token.module';
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
    TokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
