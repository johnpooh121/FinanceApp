import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KorStockEntity } from 'src/entities/KorStock.entity';
import { KorStockInfoEntity } from 'src/entities/KorStockInfo.entity';
import { CrawlController } from './crawl.controller';
import { CrawlService } from './crawl.service';

@Module({
  imports: [TypeOrmModule.forFeature([KorStockEntity, KorStockInfoEntity])],
  controllers: [CrawlController],
  providers: [CrawlService],
})
export class CrawlModule {}
