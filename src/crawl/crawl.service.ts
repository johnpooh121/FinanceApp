import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import iconv from 'iconv-lite';
import moment from 'moment-timezone';
import { STARTDATE } from 'src/common/constant';
import { KorMarketType } from 'src/common/enum';
import { KorStockEntity } from 'src/entities/KorStock.entity';
import { KorStockInfoEntity } from 'src/entities/KorStockInfo.entity';
import { Repository } from 'typeorm';
import { IndividualCrawlQueryRequest } from './dtos/individual-crawl-query.request';

@Injectable()
export class CrawlService {
  constructor(
    @InjectRepository(KorStockEntity)
    private readonly stockRepository: Repository<KorStockEntity>,
    @InjectRepository(KorStockInfoEntity)
    private readonly stockInfoRepository: Repository<KorStockInfoEntity>,
  ) {}

  makeKey(marketType: KorMarketType, code: string) {
    return `${marketType}_${code}`;
  }
  /**
   *
   * @param time millisecond
   */
  async sleep(time: number) {
    return new Promise((r) => setTimeout(r, time));
  }

  async getRawData(params: URLSearchParams) {
    const otp = await axios
      .post(
        'http://data.krx.co.kr/comm/fileDn/GenerateOTP/generate.cmd',
        params.toString(),
        {
          headers: {
            Accept: '*/*',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0',
          },
        },
      )
      .then(({ data }) => data);

    const { data: rawData } = await axios({
      method: 'POST',
      url: 'http://data.krx.co.kr/comm/fileDn/download_csv/download.cmd',
      data: new URLSearchParams({ code: otp }),
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
      },
      responseType: 'arraybuffer',
    });

    const data = iconv.decode(rawData, 'euc-kr');
    return data;
  }

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

    return this.getRawData(params);
  }

  async getISINMap() {
    const infoList = await this.stockInfoRepository.find({
      select: { isin: true, code: true, marketType: true },
    });
    return new Map(
      infoList.map(({ isin, code, marketType }) => [
        `${marketType}:${code}`,
        isin,
      ]),
    );
  }

  async getInfoMap() {
    let infoList = await this.stockInfoRepository.find({});
    if (infoList.length === 0) {
      await this.updateBasicInfo();
      infoList = await this.stockInfoRepository.find({});
    }
    return new Map(infoList.map((info) => [info.isin, info]));
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
          .replace(/,,/g, ',"",');
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
            .replace(/,,/g, ',"",');
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

  async updateDataByDate(hyphenDate: string) {
    console.log('collecting data by date : ', hyphenDate);
    try {
      const [rawData, isinMap] = await Promise.all([
        this.getDailyRawData(hyphenDate),
        this.getISINMap(),
      ]);
      await this.dbUpdateForDailyData(rawData, hyphenDate, isinMap);
      await this.checkForStockSplit();
    } catch (e) {
      console.log('error while collecting date by date : ', hyphenDate);
      console.log(e);
      return false;
    }
    return true;
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

      const rawData = await this.getRawData(params);
      const current = new Date();

      await this.stockInfoRepository.upsert(
        rawData
          .split('\n')
          .slice(1)
          .map((rowString) => {
            const modifiedRowString = rowString
              .replace(/,,/g, ',"",')
              .replace(/,,/g, ',"",');
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

  async updateDataByCode(info: KorStockInfoEntity) {
    const { isin, code, korNameShorten, marketType, companyCategory } = info;
    console.log(
      'updating data by ISIN code, name: ',
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

      const rawData = await this.getRawData(params);

      const current = new Date();

      await this.stockRepository.upsert(
        rawData
          .split('\n')
          .slice(1)
          .map((rowString) => {
            const modifiedRowString = rowString
              .replace(/,,/g, ',"",')
              .replace(/,,/g, ',"",');
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

      console.log('stockInfo db upsert completed, code: ', info.code);
    } catch (e) {
      console.log('error while updating basic info');
      console.log(e);
      return false;
    }
    return true;
  }

  async updateIndividualStock(query: IndividualCrawlQueryRequest) {
    const { isin, code, marketType } = query;
    let entity;
    if (isin) entity = await this.stockInfoRepository.findOneBy({ isin });
    else
      entity = await this.stockInfoRepository.findOneBy({ code, marketType });
    console.log('update target : ', entity);
    await this.updateDataByCode(entity);
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
      this.getInfoMap(),
    ]);

    const prevStockMap = new Map(
      prevStockList.map((stock) => [stock.isin, stock]),
    );

    await Promise.all(
      currStockList.map((stock) => {
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
          if (targetInfo) return this.updateDataByCode(targetInfo);
        }
      }),
    );
    console.log('stock split check completed');
  }

  async initializeDB() {
    console.log('db initialize started');
    const bulkSize = 0;
    await this.updateBasicInfo();
    const stockList = await this.stockInfoRepository.find({});
    let jobList: Promise<boolean>[] = [];
    let cnt = 0;
    for (const stock of stockList) {
      cnt += 1;
      console.log('update cnt : ', cnt);
      jobList.push(this.updateDataByCode(stock));
      if (jobList.length >= bulkSize) {
        await Promise.all(jobList);
        jobList = [];
        console.log('sleeping...');
        await this.sleep(1000);
      }
    }
    await Promise.all(jobList);
    console.log('db initialize completed');
  }
}
