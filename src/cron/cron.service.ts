import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MONTHLY_QUOTA } from 'src/common/constant';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async resetUserQuota() {
    await this.userRepository.update({}, { quota: MONTHLY_QUOTA });
  }

  async sendEmail() {}
}
