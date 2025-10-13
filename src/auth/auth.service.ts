import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt_payload';
import { UserService } from 'src/user/user.service';
import { RefreshCacheService } from 'src/redis/refresh-cache/refresh-cache.service';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private refreshCacheService: RefreshCacheService,
    private cloudinary: CloudinaryService,
  ) {}

  async registerUser(userPayload: RegisterUserDto, avatarPublicId: string) {
    const findUser = await this.userService.findUserByEmail(userPayload.email);
    if (findUser) throw new ConflictException('Email already exist.');
    let avatarUrl;
    if (avatarPublicId) {
      const avatar = await this.refreshCacheService.getCache(
        `avatar:${avatarPublicId}`,
      );
      if (avatar) {
        const res = await this.cloudinary.renameFile(
          avatarPublicId,
          avatarPublicId.replace('temp_avatars/avatar_url', 'books/avatars'),
        );
        console.log({ avatarUrl });
      }
    }
    const user = await this.userService.createUser(userPayload);
    const { password, ...rest } = user;
    return { sucess: true, user: rest };
  }

  async loginUser(userId: string) {
    try {
      const accessToken = await this.generateTokens(userId);
      const sessionId = await this.refreshCacheService.setRefreshTokenCache();
      return {
        accessToken,
        sessionId,
      };
    } catch (error) {
      throw error;
    }
  }

  async generateTokens(userId: string) {
    const payload: JwtPayload = { sub: userId };
    const accessToken = this.jwtService.sign(payload);
    return accessToken;
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

  async uploadAvatar(avatar: Express.Multer.File) {
    const cloudinaryResponse = await this.cloudinary.uploadFile(
      avatar,
      'temp/avatar_url',
    );
    console.log(cloudinaryResponse);
    // avatar should be a base64 string or file buffer from frontend
    return {};
  }

  async refreshToken(userId: string) {
    const accessToken = await this.generateTokens(userId);
    const sessionId = await this.refreshCacheService.setRefreshTokenCache();
    return {
      accessToken,
      sessionId,
    };
  }

  async logoutUser(userId: string) {
    // await this.userService.updateRefreshToken(userId);
  }
}
