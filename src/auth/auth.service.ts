import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
import { TokenService } from 'src/services/token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private refreshCacheService: RefreshCacheService,
    private cloudinary: CloudinaryService,
    private tokenService: TokenService,
  ) {}

  async registerUser(userPayload: RegisterUserDto) {
    const findUser = await this.userService.findUserByEmail(userPayload.email);

    if (findUser) throw new ConflictException('Email already exist.');
    try {
      if (userPayload.avatarUrl) {
        const cachedAvatar = await this.refreshCacheService.getCache(
          `avatar:${userPayload.avatarUrl}`,
        );

        if (cachedAvatar) {
          const newPublicId = userPayload.avatarUrl.replace(
            'temp/avatar_url/',
            'books/avatars/',
          );

          const res = await this.cloudinary.renameFile(
            userPayload.avatarUrl,
            newPublicId,
          );
          userPayload.avatarUrl = res.secure_url;
        }
      }
      const token = await this.tokenService.generateEmailToken(
        userPayload.email,
      );
      // generate otp and send mail, remove sent user and send successful message.
      const otp = Math.floor(100000 + Math.random() * 900000);
      await this.userService.createUser({
        ...userPayload,
        confirmEmailOtp: otp.toString(),
      });

      return { sucess: true, token, otp };
    } catch (error) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async loginUser({
    email,
    userPassword,
  }: {
    email: string;
    userPassword: string;
  }) {
    try {
      const user = await this.userService.findUserByEmail(email);
      if (!user || !bcrypt.compare(user.password, userPassword)) {
        throw new BadRequestException('Invalid Credentials');
      }

      const accessToken = await this.generateTokens(user.id, '1d');
      // // does not need user id, random crypto hash
      const refreshToken = await this.generateTokens(user.id, '1d');
      const { password, ...rest } = user;
      return {
        accessToken,
        refreshToken,
        rest,
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail({ otpCode, token }: { otpCode: string; token: string }) {
    try {
      const email = await this.tokenService.verifyEmailToken(token);
      await this.userService.verifyUpdateUser(email, otpCode);
      return { success: true, message: 'Email verified successfully.' };
    } catch (error) {
      throw error;
    }
  }

  async resendVerifyEmailCode({ email }: { email: string }) {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000);
      await this.userService.resendCode(email, otp.toString());
      const token = await this.tokenService.generateEmailToken(email);

      return { success: true, token, otp };
    } catch (error) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async generateTokens(value: string, expiresIn: string) {
    const payload: JwtPayload = { sub: value };
    const token = expiresIn
      ? this.jwtService.sign(payload, { expiresIn, secret: 'secret' })
      : this.jwtService.sign(payload);
    return token;
  }

  async validateUser(userPayload: LoginUserDto) {
    const { email, password } = userPayload;
    const user = await this.userService.findUserByEmail(email);
    const isCorrectPassword = await bcrypt.compare(
      password,
      user?.password || '',
    );
    if (!user || !isCorrectPassword) {
      throw new UnauthorizedException('Invalid email and password.');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email.');
    }
    return { id: user.id };
  }

  async uploadAvatar(avatar: Express.Multer.File) {
    try {
      const cloudinaryResponse = await this.cloudinary.uploadFile(
        avatar,
        'temp/avatar_url',
      );
      // change to cookies or session
      this.refreshCacheService.setInCache({
        name: `avatar:${cloudinaryResponse.public_id}`,
        data: cloudinaryResponse.public_id,
        expiration: 24 * 60 * 60,
      });

      return { avatarUrl: cloudinaryResponse.public_id };
    } catch (error) {
      throw new InternalServerErrorException('Error uploading avatar');
    }
  }

  async refreshToken(userId: string) {
    const accessToken = await this.generateTokens(userId, '7d');
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
