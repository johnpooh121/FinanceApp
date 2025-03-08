import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment-timezone';
import { KorStockEntity } from 'src/entities/KorStock.entity';
import { KorStockInfoEntity } from 'src/entities/KorStockInfo.entity';
import { UtilService } from 'src/util/util.service';
import { Repository } from 'typeorm';

@Injectable()
export class CrawlDividendService {
  constructor(
    @InjectRepository(KorStockEntity)
    private readonly stockRepository: Repository<KorStockEntity>,
    @InjectRepository(KorStockInfoEntity)
    private readonly stockInfoRepository: Repository<KorStockInfoEntity>,
    private readonly util: UtilService,
  ) {}

  async updateDailyDividendData(hyphenDate: string) {
    const day = moment.utc(hyphenDate).day();
    console.log('updating dividend info for date : ', hyphenDate);
    if (day === 0 || day === 6) {
      console.log('today is not a business day');
      throw new BadRequestException('today is not a business day');
    }
    const plainDate = hyphenDate.replace(/-/g, '');
    const params = new URLSearchParams([
      ['locale', 'ko_KR'],
      ['mktId', 'ALL'],
      ['trdDd', plainDate],
      ['share', '1'],
      ['money', '1'],
      ['csvxlx_isNo', 'false'],
      ['name', 'fileDown'],
      ['url', 'dbms/MDC/STAT/standard/MDCSTAT03501'],
    ]);

    const [data, codeMap] = await Promise.all([
      this.util.getRawData(params),
      this.util.getCodeMap(),
    ]);
    const current = new Date();
    console.log('updating DB');

    data
      .split('\n')
      .slice(1)
      .forEach((rowString) => {
        const modifiedRowString = rowString
          .replace(/,,/g, ',"",')
          .replace(/,,/g, ',"",');
        const entries = modifiedRowString
          .split('","')
          .map((str) => str.replace(/"/g, ''));
        if (entries[2] === '' || entries[3] === '')
          throw new BadRequestException(
            `empty close price, meaning ${hyphenDate} is holiday`,
          );
      });
    await this.stockRepository.upsert(
      data
        .split('\n')
        .slice(1)
        .map((rowString) => {
          const modifiedRowString = rowString
            .replace(/,,/g, ',"",')
            .replace(/,,/g, ',"",');
          const entries = modifiedRowString
            .split('","')
            .map((str) => str.replace(/"/g, ''));
          const info = codeMap.get(entries[0]);
          if (!info) return null;
          const { isin, marketType } = info;
          return {
            isin,
            date: hyphenDate,
            code: entries[0],
            name: entries[1],
            marketType,
            adjClose: Number(entries[2]),
            change: Number(entries[3]),
            changeRate: Number(entries[4]),
            eps: entries[5] ? Number(entries[5]) : null,
            per: entries[6] ? Number(entries[6]) : null,
            bps: entries[8] ? Number(entries[8]) : null,
            pbr: entries[9] ? Number(entries[9]) : null,
            dps: entries[10] ? Number(entries[10]) : null,
            dy: entries[11] ? Number(entries[11]) : null,
            updatedAt: current,
          };
        })
        .filter((el) => el != null),
      ['date', 'isin'],
    );

    console.log('db upsert completed');
  }
}
