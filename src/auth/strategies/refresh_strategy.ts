import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/jwt_payload';
import refreshJwtConfig from 'src/config/refresh.jwt.config';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshJWTStrategy extends PassportStrategy(
  Strategy,
  'refresh_jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private readonly refrestJwtConfiguration: ConfigType<
      typeof refreshJwtConfig
    >,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: refrestJwtConfiguration.secret!,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.headers['authorization']?.split(' ')[1];
    const userId = payload.sub;
    return this.authService.validateRefreshToken(userId, refreshToken!);
  }
}
