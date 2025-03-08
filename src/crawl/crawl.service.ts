import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KorStockEntity } from 'src/entities/KorStock.entity';
import { KorStockInfoEntity } from 'src/entities/KorStockInfo.entity';
import { UtilService } from 'src/util/util.service';
import { Repository } from 'typeorm';
import { CrawlDividendService } from './services/crawl-dividend.service';
import { CrawlForeignOwnService } from './services/crawl-foreign-own.service';
import { CrawlInfoService } from './services/crawl-info.service';
import { CrawlOhlcvService } from './services/crawl-ohlcv.service';

@Injectable()
export class CrawlService {
  constructor(
    @InjectRepository(KorStockEntity)
    private readonly stockRepository: Repository<KorStockEntity>,
    @InjectRepository(KorStockInfoEntity)
    private readonly stockInfoRepository: Repository<KorStockInfoEntity>,
    private readonly util: UtilService,
    private readonly crawlOhlcv: CrawlOhlcvService,
    private readonly crawlDividend: CrawlDividendService,
    private readonly crawlInfo: CrawlInfoService,
    private readonly crawlForeignOwn: CrawlForeignOwnService,
  ) {}

  async initializeDB() {
    console.log('db initialize started');
    const bulkSize = 0;
    await this.crawlInfo.updateBasicInfo();
    const stockList = await this.stockInfoRepository.find({});
    let jobList: Promise<boolean>[] = [];
    let cnt = 0;
    for (const stock of stockList) {
      cnt += 1;
      console.log('update cnt : ', cnt);
      jobList.push(this.crawlOhlcv.updateOhlcvByInfo(stock));
      jobList.push(this.crawlForeignOwn.updateForeignOwnByInfo(stock));
      jobList.push(this.crawlDividend.updateDividendDataByInfo(stock));
      if (jobList.length >= bulkSize) {
        await Promise.all(jobList);
        jobList = [];
        console.log('sleeping...');
        await this.util.sleep(1000);
      }
    }
    await Promise.all(jobList);
    console.log('db initialize completed');
  }
}
