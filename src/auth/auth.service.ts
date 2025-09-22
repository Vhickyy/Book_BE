import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt_payload';
import refreshJwtConfig from 'src/config/refresh.jwt.config';
import type { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshJwt: ConfigType<typeof refreshJwtConfig>,
    private userService: UserService,
  ) {}

  async registerUser(userPayload: RegisterUserDto) {
    const findUser = await this.userService.findUserByEmail(userPayload.email);
    if (findUser) throw new ConflictException('Email already exist.');
    const user = await this.userService.createUser(userPayload);
    return user;
  }

  async loginUser(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateRefreshToken(userId, hashRefreshToken);
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: string) {
    const payload: JwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshJwt),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(userPayload: LoginUserDto) {
    const { email, password } = userPayload;
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email and password.');
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      throw new UnauthorizedException('Invalid email and password.');
    }
    return { id: user.id };
  }

  async refreshToken(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateRefreshToken(userId, hashRefreshToken);
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findOne(userId);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Invalid refresh token.');
    const isValidRefreshToken = await argon2.verify(
      refreshToken,
      user.refreshToken,
    );
    if (!isValidRefreshToken)
      throw new UnauthorizedException('Invalid refresh token.');
    return userId;
  }

  async logoutUser(userId: string) {
    await this.userService.updateRefreshToken(userId);
  }
}
