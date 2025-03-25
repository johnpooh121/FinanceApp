import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KorMarketType } from 'src/common/enum';
import { KorStockInfoEntity } from 'src/entities/KorStockInfo.entity';
import { UtilService } from 'src/util/util.service';
import { Repository } from 'typeorm';

@Injectable()
export class CrawlInfoService implements OnModuleInit {
  constructor(
    @InjectRepository(KorStockInfoEntity)
    private readonly stockInfoRepository: Repository<KorStockInfoEntity>,
    private readonly util: UtilService,
  ) {}

  async onModuleInit() {
    const cnt = await this.stockInfoRepository.count({});
    if (cnt === 0) await this.updateBasicInfo();
  }

  async updateBasicInfo() {
    console.log('updating basic info');
    try {
      const params = new URLSearchParams([
        ['locale', 'ko_KR'],
        ['mktId', 'ALL'],
        ['share', '1'],
        ['csvxlx_isNo', 'false'],
        ['name', 'fileDown'],
        ['url', 'dbms/MDC/STAT/standard/MDCSTAT01901'],
      ]);

      const rawData = await this.util.getRawData(params);
      const current = new Date();

      await this.stockInfoRepository.upsert(
        rawData
          .split('\n')
          .slice(1)
          .map((rowString) => {
            const modifiedRowString = rowString
              .replace(/,,/g, ',"",')
              .replace(/,,/g, ',"",')
              .concat('"');
            const entries = modifiedRowString
              .split('","')
              .map((str) => str.replace(/"/g, ''));

            return {
              isin: entries[0],
              code: entries[1],
              korName: entries[2],
              korNameShorten: entries[3],
              engName: entries[4],
              listingDate: entries[5],
              marketType: entries[6] as KorMarketType,
              securityType: entries[7],
              companyCategory: entries[8],
              stockType: entries[9],
              parValue: entries[10],
              shareCount: entries[11],
              updatedAt: current,
            };
          }),
        ['code', 'marketType'],
      );

      console.log('stockInfo db upsert completed');
    } catch (e) {
      console.log('error while updating basic info');
      console.log(e);
      return false;
    }
    return true;
  }
}
