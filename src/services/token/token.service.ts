import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  generateAccessToken(value: string) {
    return this.jwtService.sign({ sub: value });
  }

  generateEmailToken(value: string) {
    return this.jwtService.signAsync(
      { sub: value },
      {
        expiresIn: process.env.OTP_EXPIRY,
        secret: process.env.OTP_SECRET,
      },
    );
  }

  async verifyEmailToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.OTP_SECRET,
      });

      return payload.sub;
    } catch (err) {
      throw this.catchTokenError(err, 'Invalid Otp');
    }
  }

  catchTokenError(err: { name: string }, msg?: string) {
    if (err.name === 'TokenExpiredError') {
      throw new BadRequestException('Verification token expired');
    }

    throw new BadRequestException(msg || 'Invalid token');
  }
}
