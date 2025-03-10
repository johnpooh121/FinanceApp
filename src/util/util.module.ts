import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KorStockInfoEntity } from 'src/entities/KorStockInfo.entity';
import { MetadataEntity } from 'src/entities/metadata.entity';
import { UtilService } from './util.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([KorStockInfoEntity, MetadataEntity])],
  providers: [UtilService],
  exports: [UtilService],
})
export class UtilModule {}
