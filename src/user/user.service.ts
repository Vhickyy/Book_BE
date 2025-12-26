import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from 'src/auth/dto/register.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async createUser(userPayload: Partial<User>) {
    // async createUser(userPayload: RegisterUserDto) {
    const user = this.userRepo.create(userPayload);
    return this.userRepo.save(user);
  }

  async findUserByEmail(email: string) {
    const user = this.userRepo.findOne({
      where: { email },
    });

    return user;
  }

  async findOne(id: string) {
    const user = this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User does not exists');
    }
    return user;
  }

  async getUser(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('No user with this id');
    }
    return user;
  }

  async verifyUpdateUser(email: string, otpCode: string) {
    const user = await this.findUserByEmail(email);
    if (!user) throw new BadRequestException('Invalid Otp');
    if (user.isVerified) {
      throw new BadRequestException('User already verified');
    }

    if (user.confirmEmailOtp !== otpCode)
      throw new BadRequestException('Invalid Otp');

    user.confirmEmailOtp = '';
    user.isVerified = true;
    await this.userRepo.save(user);
    return true;
  }

  async resendCode(email: string, otpCode: string) {
    const user = await this.findUserByEmail(email);

    if (!user) throw new NotFoundException('Invalid Email');
    user.confirmEmailOtp = otpCode;
    await this.userRepo.save(user);
  }
}
