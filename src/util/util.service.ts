import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import iconv from 'iconv-lite';
import { KorMarketType } from 'src/common/enum';
import { KorStockInfoEntity } from 'src/entities/KorStockInfo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UtilService {
  constructor(
    @InjectRepository(KorStockInfoEntity)
    private readonly stockInfoRepository: Repository<KorStockInfoEntity>,
  ) {}

  makeKey(marketType: KorMarketType, code: string) {
    return `${marketType}:${code}`;
  }
  /**
   *
   * @param time millisecond
   */
  async sleep(time: number) {
    return new Promise((r) => setTimeout(r, time));
  }

  async getISINMap() {
    const infoList = await this.stockInfoRepository.find({
      select: { isin: true, code: true, marketType: true },
    });
    return new Map(
      infoList.map(({ isin, code, marketType }) => [
        this.makeKey(marketType, code),
        isin,
      ]),
    );
  }

  async getInfoMap() {
    const infoList = await this.stockInfoRepository.find({});
    return new Map(infoList.map((info) => [info.isin, info]));
  }

  async getCodeMap() {
    const infoList = await this.stockInfoRepository.find({});
    return new Map(infoList.map((info) => [info.code, info]));
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
}
