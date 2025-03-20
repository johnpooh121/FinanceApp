import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KorStockEntity } from 'src/entities/KorStock.entity';
import { KorStockInfoEntity } from 'src/entities/KorStockInfo.entity';
import { DataController } from './data.controller';
import { DataService } from './data.service';

@Module({
  imports: [TypeOrmModule.forFeature([KorStockEntity, KorStockInfoEntity])],
  controllers: [DataController],
  providers: [DataService],
})
export class DataModule {}
