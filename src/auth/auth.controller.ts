import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { LocalAuthGuard } from './gaurds/local_auth/local_auth.guard';
import { JwtAuthGuard } from './gaurds/jwt_auth/jwt_auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerifyEmailDto } from './dto/verify_email.dto';

const sessionObj = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() user: RegisterUserDto) {
    return this.authService.registerUser(user);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginUser(@Req() req, @Res({ passthrough: true }) res) {
    const { accessToken, refreshToken } = await this.authService.loginUser(
      req.user.id,
    );
    res.cookie('sessionId', refreshToken, sessionObj);
    return { sucess: true, accessToken };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() { token, otpCode }: VerifyEmailDto) {
    return await this.authService.verifyEmail({ token, otpCode });
  }

  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@UploadedFile() avatar: Express.Multer.File) {
    if (!avatar) {
      throw new BadRequestException('No avatar uploaded');
    }
    const { avatarUrl } = await this.authService.uploadAvatar(avatar);
    return {
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req) {
    return this.authService.logoutUser(req.user.id);
  }
}
