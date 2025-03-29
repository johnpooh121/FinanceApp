import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataModule } from 'src/data/data.module';
import { MetadataEntity } from 'src/entities/metadata.entity';
import { UserEntity } from 'src/entities/user.entity';
import { CronController } from './cron.controller';
import { CronService } from './cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, MetadataEntity]), DataModule],
  controllers: [CronController],
  providers: [CronService],
})
export class CronModule {}
