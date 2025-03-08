import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KorStockEntity } from 'src/entities/KorStock.entity';
import { KorStockInfoEntity } from 'src/entities/KorStockInfo.entity';
import { CrawlController } from './crawl.controller';
import { CrawlService } from './crawl.service';
import { CrawlDividendService } from './services/crawl-dividend.service';
import { CrawlInfoService } from './services/crawl-info.service';
import { CrawlOhlcvService } from './services/crawl-ohlcv.service';
import { CrawlForeignOwnService } from './services/crawl-foreign-own.service';

@Module({
  imports: [TypeOrmModule.forFeature([KorStockEntity, KorStockInfoEntity])],
  controllers: [CrawlController],
  providers: [
    CrawlService,
    CrawlDividendService,
    CrawlInfoService,
    CrawlOhlcvService,
    CrawlForeignOwnService,
  ],
})
export class CrawlModule {}
