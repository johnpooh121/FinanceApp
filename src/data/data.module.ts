import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KorStockEntity } from 'src/entities/KorStock.entity';
import { KorStockInfoEntity } from 'src/entities/KorStockInfo.entity';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { UserEntity } from 'src/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([KorStockEntity, KorStockInfoEntity, UserEntity]),
  ],
  controllers: [DataController],
  providers: [DataService],
})
export class DataModule {}
