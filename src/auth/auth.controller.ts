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
import { CacheInterceptor } from '@nestjs/cache-manager';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() user: RegisterUserDto, @Req() req) {
    const avatarId = req.cookies?.avatarId;
    return this.authService.registerUser(user, avatarId);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async loginUser(@Req() req, @Res({ passthrough: true }) res) {
    const { accessToken, sessionId } = await this.authService.loginUser(
      req.user.id,
    );
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { sucess: true, accessToken };
  }

  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @UploadedFile() avatar: Express.Multer.File,
    @Res({ passthrough: true }) res,
  ) {
    console.log({ avatar });
    console.log('FILE:', avatar);

    if (!avatar) {
      throw new BadRequestException('No avatar uploaded');
    }
    // check for file
    const {} = await this.authService.uploadAvatar(avatar);
    // res.cookie('avatarId', avatarId, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'none',
    //   maxAge: 5 * 60 * 60 * 1000,
    // });
    return { hi: 'ji' };
  }

  @Post('refresh')
  async refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    return this.authService.logoutUser(req.user.id);
  }
}
