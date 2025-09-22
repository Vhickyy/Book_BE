import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { LocalAuthGuard } from './gaurds/local_auth/local_auth.guard';
import { JwtAuthGuard } from './gaurds/jwt_auth/jwt_auth.guard';
import { RefreshJWTAuthGuard } from './gaurds/refresh_auth/refresh_auth.guard';

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
  async loginUser(@Req() req) {
    return this.authService.loginUser(req.user.id);
  }

  @UseGuards(RefreshJWTAuthGuard)
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
