import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { createWriteStream } from 'fs';
import moment from 'moment-timezone';
import { COLUMN_MAP } from 'src/common/constant';
import { KorStockEntity } from 'src/entities/KorStock.entity';
import { KorStockInfoEntity } from 'src/entities/KorStockInfo.entity';
import { UtilService } from 'src/util/util.service';
import { Repository } from 'typeorm';
import { DataRequestPostBody } from './dtos/request/data-request.post.body';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(KorStockEntity)
    private readonly stockRepository: Repository<KorStockEntity>,
    @InjectRepository(KorStockInfoEntity)
    private readonly stockInfoRepository: Repository<KorStockInfoEntity>,
    private readonly util: UtilService,
  ) {}

  async getCSV(query: DataRequestPostBody, res: Response) {
    // console.log(JSON.stringify(query['data']));
    // const { startDate, endDate, codes, isAllIssue } = JSON.parse(query['data']);

    const { startDate, endDate, codes: stringCodes, isAllIssue } = query;
    const codes = stringCodes
      .split('')
      .filter((c) => c === '\n' || ('0' <= c && c <= '9'))
      .join('')
      .split('\n');
    console.log(codes);
    const baseQuery = this.stockRepository
      .createQueryBuilder('ks')
      .where('ks.date >= :startDate AND ks.date <= :endDate', {
        startDate,
        endDate,
      });
    if (!isAllIssue) baseQuery.andWhere('ks.code IN (:...codes)', { codes });
    const dbStream = await baseQuery.orderBy('ks.date', 'ASC').stream();

    const fileWriteStream = createWriteStream('test.csv');
    fileWriteStream.write(
      Object.values(COLUMN_MAP)
        .map((str) => `"${str}"`)
        .join(',')
        .concat('\n'),
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="kr-stock-${moment.tz('Asia/Seoul').format('YYYY-MM-DD--HH-mm-ss')}.csv"`,
    );
    res.setHeader('Content-Type', 'application/octet-stream;charset=UTF-8');

    dbStream.on('readable', () => {
      let data;
      // console.log('starting?');
      while ((data = dbStream.read())) {
        // console.log('hi');
        // console.log(data);
        data.ks_date = data.ks_date.toISOString().slice(0, 10);
        const rowString = Object.keys(COLUMN_MAP)
          .map((key) => `"${data[key] || ''}"`)
          .join(',')
          .concat('\n');
        // fileWriteStream.write(rowString);
        res.write(rowString);
      }
    });
    dbStream.on('end', () => {
      console.log('stream ended');
      res.end();
    });
  }
}
