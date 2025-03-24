import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { PatchUserBody } from './dtos/patch-user.body';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getUserById(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  async editUser(id: string, body: PatchUserBody) {
    const { email, sub, criteria } = body;
    return this.userRepository.update(
      { id },
      { email, updatedAt: new Date(), sub, criteria },
    );
  }
}
