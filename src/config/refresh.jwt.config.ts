import { registerAs } from '@nestjs/config';
import { JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';

const refreshJwtConfig = (): JwtSignOptions => ({
  secret: process.env.REFRESH_JWT_SECRET,
  expiresIn: process.env.REFRESH_JWT_EXPIRES_IN,
});

export default registerAs('refresh_jwt', refreshJwtConfig);
