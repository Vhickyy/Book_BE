import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local_strategy';
import jwtConfig from 'src/config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JWTStrategy } from './strategies/jwt_strategy';
import refreshJwtConfig from 'src/config/refresh.jwt.config';
import { RefreshJWTStrategy } from './strategies/refresh_strategy';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    PassportModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JWTStrategy, RefreshJWTStrategy],
})
export class AuthModule {}
