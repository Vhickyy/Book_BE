import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

const jwtConfig = (): JwtModuleOptions => ({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
});

export default registerAs('jwt', jwtConfig);
