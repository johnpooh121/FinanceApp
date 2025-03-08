import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KorStockInfoEntity } from 'src/entities/KorStockInfo.entity';
import { UtilService } from './util.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([KorStockInfoEntity])],
  providers: [UtilService],
  exports: [UtilService],
})
export class UtilModule {}
