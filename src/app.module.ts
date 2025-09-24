import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { AuthorBookModule } from './author-book/author-book.module';
import { CacheModule } from '@nestjs/cache-manager';
@Module({
  imports: [
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
    CacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
