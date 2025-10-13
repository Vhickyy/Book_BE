import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from 'src/auth/dto/register.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async createUser(userPayload: RegisterUserDto) {
    const user = this.userRepo.create(userPayload);
    return this.userRepo.save(user);
  }

  async findUserByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email },
    });
  }

  async findOne(id: string) {
    return this.userRepo.findOne({
      where: { id },
    });
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
}
