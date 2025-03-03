import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import iconv from 'iconv-lite';
import { KorMarketType } from 'src/common/enum';
import { KorStockEntity } from 'src/entities/korStock.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CrawlService {
  constructor(
    @InjectRepository(KorStockEntity)
    private readonly stockRepository: Repository<KorStockEntity>,
  ) {}

  async getDailyRawData(hyphenDate: string) {
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

    console.log('otp: ', otp);

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

  async dbUpdate(rawData: string, hyphenDate: string) {
    const data = rawData.replace(/"/g, '');
    const current = new Date();
    console.log('updating DB');

    await this.stockRepository.upsert(
      data
        .split('\n')
        .slice(1)
        .map((rowString) => {
          const entries = rowString.split(',');
          return {
            date: hyphenDate,
            id: entries[0],
            name: entries[1],
            marketType: entries[2] as KorMarketType,
            companyCategory: entries[3],
            closePrice: Number(entries[4]),
            change: Number(entries[5]),
            openPrice: Number(entries[7]),
            highPrice: Number(entries[8]),
            lowPrice: Number(entries[9]),
            tradingVolume: entries[10],
            tradingValue: entries[11],
            marketCap: entries[12],
            shareCount: entries[13],
            updatedAt: current,
          };
        }),
      ['id', 'date'],
    );

    console.log('db upsert completed');
  }

  async getDataByDate(hyphenDate: string) {
    console.log('collecting data by date : ', hyphenDate);
    try {
      const rawData = await this.getDailyRawData(hyphenDate);
      await this.dbUpdate(rawData, hyphenDate);
    } catch (e) {
      console.log('error while collecting date by date : ', hyphenDate);
      console.log(e);
      return false;
    }
    return true;
  }
}
