import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/gaurds/jwt_auth/jwt_auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUser(@Req() req) {
    return this.userService.getUser(req.user.id);
  }
}
