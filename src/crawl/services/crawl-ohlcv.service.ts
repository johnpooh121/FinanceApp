import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment-timezone';
import { STARTDATE } from 'src/common/constant';
import { KorMarketType } from 'src/common/enum';
import { KorStockEntity } from 'src/entities/KorStock.entity';
import { KorStockInfoEntity } from 'src/entities/KorStockInfo.entity';
import { UtilService } from 'src/util/util.service';
import { Repository } from 'typeorm';
import { IndividualCrawlQueryRequest } from '../dtos/individual-crawl-query.request';

@Injectable()
export class CrawlOhlcvService {
  constructor(
    @InjectRepository(KorStockEntity)
    private readonly stockRepository: Repository<KorStockEntity>,
    @InjectRepository(KorStockInfoEntity)
    private readonly stockInfoRepository: Repository<KorStockInfoEntity>,
    private readonly util: UtilService,
  ) {}

  async getDailyRawData(hyphenDate: string) {
    const day = moment.utc(hyphenDate).day();
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
      ['url', 'dbms/MDC/STAT/standard/MDCSTAT01501'],
    ]);

    return this.util.getRawData(params);
  }

  async dbUpdateForDailyData(
    data: string,
    hyphenDate: string,
    isinMap: Map<string, string>,
  ) {
    const current = new Date();
    console.log('updating DB');

    data
      .split('\n')
      .slice(1)
      .forEach((rowString) => {
        const modifiedRowString = rowString
          .replace(/,,/g, ',"",')
          .replace(/,,/g, ',"",')
          .concat('"');
        const entries = modifiedRowString
          .split('","')
          .map((str) => str.replace(/"/g, ''));
        if (entries[4] === '' || entries[5] === '')
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
            .replace(/,,/g, ',"",')
            .concat('"');
          const entries = modifiedRowString
            .split('","')
            .map((str) => str.replace(/"/g, ''));
          const isin = isinMap.get(`${entries[2]}:${entries[0]}`);
          if (!isin) return null;
          return {
            isin,
            date: hyphenDate,
            code: entries[0],
            name: entries[1],
            marketType: entries[2] as KorMarketType,
            companyCategory: entries[3],
            adjClose: Number(entries[4]),
            change: Number(entries[5]),
            changeRate: Number(entries[6]),
            openPrice: Number(entries[7]),
            highPrice: Number(entries[8]),
            lowPrice: Number(entries[9]),
            tradingVolume: entries[10],
            tradingValue: entries[11],
            marketCap: entries[12],
            shareCount: entries[13],
            updatedAt: current,
          };
        })
        .filter((el) => el != null),
      ['date', 'isin'],
    );

    console.log('db upsert completed');
  }

  async updateOhlcvByDate(hyphenDate: string) {
    console.log('collecting data by date : ', hyphenDate);
    try {
      const [rawData, isinMap] = await Promise.all([
        this.getDailyRawData(hyphenDate),
        this.util.getISINMap(),
      ]);
      await this.dbUpdateForDailyData(rawData, hyphenDate, isinMap);
    } catch (e) {
      console.log('error while collecting date by date : ', hyphenDate);
      console.log(e);
      return false;
    }
    return true;
  }

  async updateOhlcvByInfo(info: KorStockInfoEntity) {
    const { isin, code, korNameShorten, marketType, companyCategory } = info;
    console.log(
      'updating ohlcv data by ISIN code, name: ',
      info.korNameShorten,
      ' code : ',
      info.code,
    );
    try {
      const params = new URLSearchParams([
        ['locale', 'ko_KR'],
        ['share', '1'],
        ['money', '1'],
        ['csvxlx_isNo', 'false'],
        ['name', 'fileDown'],
        ['url', 'dbms/MDC/STAT/standard/MDCSTAT01701'],
        ['strtDd', STARTDATE.replace(/-/g, '')],
        ['endDd', moment.utc().format('YYYYMMDD')],
        ['adjStkPrc', '2'],
        ['adjStkPrc_check', 'Y'],
        ['isuCd', isin],
      ]);

      const rawData = await this.util.getRawData(params);

      const current = new Date();

      await this.stockRepository.upsert(
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
              isin,
              date: entries[0],
              code,
              name: korNameShorten,
              marketType,
              companyCategory,
              adjClose: Number(entries[1]),
              change: Number(entries[2]),
              changeRate: Number(entries[3]),
              openPrice: Number(entries[4]),
              highPrice: Number(entries[5]),
              lowPrice: Number(entries[6]),
              tradingVolume: entries[7],
              tradingValue: entries[8],
              marketCap: entries[9],
              shareCount: entries[10],
              updatedAt: current,
            };
          }),
        ['date', 'isin'],
      );

      console.log('stock ohlcv db upsert completed, code: ', info.code);
    } catch (e) {
      console.log('error while updating basic info');
      console.log(e);
      return false;
    }
    return true;
  }

  async updateOhlcvByCode(query: IndividualCrawlQueryRequest) {
    const { code } = query;
    const entity = await this.stockInfoRepository.findOneByOrFail({ code });
    console.log('update target : ', entity);
    await this.updateOhlcvByInfo(entity);
  }

  async updateAccPropForADay(date: string) {
    console.log('updating yearMaxPrice, yearMinPrice');
    console.time('updating acc');
    const aYearAgo = moment
      .utc(date)
      .subtract({ year: 1 })
      .format('YYYY-MM-DD');
    const res: { isin: string; yearMinPrice: number; yearMaxPrice: number }[] =
      await this.stockRepository.manager.query(
        `
      SELECT MIN(adjClose) yearMinPrice, MAX(adjClose) yearMaxPrice, isin from KorStock
      where date >= ? and date <= ?
      group by isin
      `,
        [aYearAgo, date],
      );
    await Promise.all(
      res.map(({ isin, yearMinPrice, yearMaxPrice }) =>
        this.stockRepository.update(
          { isin, date },
          { yearMaxPrice, yearMinPrice },
        ),
      ),
    );
    console.timeEnd('updating acc');
  }
}
