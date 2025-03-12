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

  async crawlDaily(hyphenDate) {
    const codeMap = await this.util.getCodeMap();
    try {
      const info = codeMap.get('005930');
      if (info) await this.crawlOhlcv.updateOhlcvByInfo(info);
    } catch (e) {
      console.log(e);
    }
    await Promise.all([
      this.crawlOhlcv.updateOhlcvByDate(hyphenDate),
      this.crawlDividend.updateDailyDividendData(hyphenDate),
      this.crawlForeignOwn.updateForeignOwnByDate(hyphenDate),
    ]);
    await this.checkForStockSplit();
  }

  async checkForStockSplit() {
    const dateList = (
      await this.stockRepository
        .createQueryBuilder('st')
        .select('date')
        .groupBy('date')
        .orderBy('date', 'DESC')
        .getRawMany()
    ).map(({ date }) => date);

    if (dateList.length < 2) return;
    const [currStockList, prevStockList, infoMap] = await Promise.all([
      this.stockRepository.find({ where: { date: dateList[0] } }),
      this.stockRepository.find({ where: { date: dateList[1] } }),
      this.util.getInfoMap(),
    ]);

    const prevStockMap = new Map(
      prevStockList.map((stock) => [stock.isin, stock]),
    );

    for (const stock of currStockList) {
      const prevStock = prevStockMap.get(stock.isin);
      if (!prevStock) return;
      if (prevStock.adjClose + stock.change !== stock.adjClose) {
        console.log(
          'stock split detected, key : ',
          stock.isin,
          ' name : ',
          stock.name,
        );
        const targetInfo = infoMap.get(stock.isin);
        if (targetInfo) {
          await Promise.all([
            this.crawlOhlcv.updateOhlcvByInfo(targetInfo),
            this.crawlDividend.updateDividendDataByInfo(targetInfo),
            this.crawlForeignOwn.updateForeignOwnByInfo(targetInfo),
          ]);
          await this.util.sleep(1000);
        }
      }
    }

    console.log('stock split check completed');
  }
}
