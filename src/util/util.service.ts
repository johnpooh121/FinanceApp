import { DescribeInstancesCommand, EC2Client } from '@aws-sdk/client-ec2';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import iconv from 'iconv-lite';
import { KorMarketType } from 'src/common/enum';
import { KorStockInfoEntity } from 'src/entities/KorStockInfo.entity';
import { MetadataEntity } from 'src/entities/metadata.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UtilService implements OnModuleInit {
  private client;

  constructor(
    @InjectRepository(KorStockInfoEntity)
    private readonly stockInfoRepository: Repository<KorStockInfoEntity>,
    @InjectRepository(MetadataEntity)
    private readonly metadataRepository: Repository<MetadataEntity>,
  ) {
    this.client = new EC2Client({
      region: 'ap-northeast-2',
      // credentials: {
      //   accessKeyId: process.env.AWS_ACCESS_KEY as string,
      //   secretAccessKey: process.env.AWS_SECRET_KEY as string,
      // },
    });
  }

  async onModuleInit() {
    if (process.env.IS_LOCAL !== 'true') return this.updatePrivateIP();
  }

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

  async updatePrivateIP() {
    const cmd = new DescribeInstancesCommand({
      Filters: [{ Name: 'instance-state-name', Values: ['running'] }],
    });
    const res = await this.client.send(cmd);
    console.log(res);
    console.log(res?.Reservations?.[0]?.Instances?.[0]?.Tags);
    if (!res?.Reservations || res?.Reservations?.length === 0) {
      console.log('no ec2 reservation!');
      return null;
    }
    const instances = res?.Reservations[0]?.Instances?.filter(
      (ec2) =>
        ec2?.Tags &&
        ec2?.Tags?.findIndex(
          ({ Key: k, Value: v }) =>
            k === 'elasticbeanstalk:environment-name' &&
            v === 'Finance-App-env',
        ) !== -1 &&
        ec2.LaunchTime,
    );

    console.log(instances);

    if (!instances || instances.length === 0) {
      console.log('no finance cron instance!');
      return null;
    }
    if (instances.length > 1) {
      console.log('environment is updating, there are multiple instances.');
      instances.sort(
        (a, b) =>
          (b.LaunchTime?.getTime() ?? 0) - (a.LaunchTime?.getTime() ?? 0),
      );
    }
    await this.metadataRepository.upsert(
      {
        key: 'privateIP',
        value: instances[0].PrivateIpAddress,
      },
      ['key'],
    );
    console.log(
      'Successfully inserted private ip, ',
      instances[0].PrivateIpAddress,
    );
  }
}
