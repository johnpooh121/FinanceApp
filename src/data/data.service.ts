import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import moment from 'moment-timezone';
import { COLUMN_MAP } from 'src/common/constant';
import { DataCriteriaDTO } from 'src/common/dtos/data-criteria.dto';
import { KorStockEntity } from 'src/entities/KorStock.entity';
import { KorStockInfoEntity } from 'src/entities/KorStockInfo.entity';
import { UserEntity } from 'src/entities/user.entity';
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
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly util: UtilService,
  ) {}

  async getCSV(query: DataRequestPostBody, userId: string, res: Response) {
    const { startDate, endDate, codes: stringCodes, isAllIssue } = query;
    const codes = stringCodes
      .split('')
      .filter((c) => c === '\n' || ('0' <= c && c <= '9'))
      .join('')
      .split('\n');

    const baseQuery = this.stockRepository
      .createQueryBuilder('ks')
      .where('ks.date >= :startDate AND ks.date <= :endDate', {
        startDate,
        endDate,
      });
    if (!isAllIssue) baseQuery.andWhere('ks.code IN (:...codes)', { codes });
    const [rowCount, userInfo] = await Promise.all([
      baseQuery.getCount(),
      this.userRepository.findOneByOrFail({ id: userId }),
    ]);
    if (rowCount > userInfo.quota)
      throw new BadRequestException('quota가 부족합니다!');

    const dbStream = await baseQuery.orderBy('ks.date', 'ASC').stream();

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="kr-stock-${moment.tz('Asia/Seoul').format('YYYY-MM-DD--HH-mm-ss')}.csv"`,
    );
    res.setHeader('Content-Type', 'application/octet-stream;charset=UTF-8');

    const csvTopHeader = Object.values(COLUMN_MAP)
      .map((str) => `"${str}"`)
      .join(',')
      .concat('\n');
    res.write('\ufeff');
    res.write(csvTopHeader);

    dbStream.on('readable', () => {
      let data;
      while ((data = dbStream.read())) {
        data.ks_date = data.ks_date.toISOString().slice(0, 10);
        const rowString = Object.keys(COLUMN_MAP)
          .map((key) => `"${data[key] || ''}"`)
          .join(',')
          .concat('\n');
        res.write(rowString.replace(/\"\"/g, ''));
      }
    });
    dbStream.on('end', async () => {
      console.log('stream ended');
      await this.userRepository
        .createQueryBuilder('u')
        .update()
        .set({ quota: () => `quota - ${rowCount}` })
        .where({ id: userId })
        .execute();
      res.end();
    });
  }

  async getRecommend(body: DataCriteriaDTO) {
    const { maxPbr, maxPer, minDy, minPbr, minPer, vsHighPrice, vsLowPrice } =
      body;
    const { date: latestWorkDay } = await this.stockRepository.findOneOrFail({
      where: {},
      order: { date: 'desc' },
    });
    const aYearAgo = moment
      .utc(latestWorkDay)
      .subtract({ year: 1 })
      .format('YYYY-MM-DD');

    const whereQuery: string[] = [];
    if (maxPbr) whereQuery.push(`(pbr <= ${maxPbr})`);
    if (minPbr) whereQuery.push(`(pbr >= ${minPbr})`);
    if (maxPer) whereQuery.push(`(per <= ${maxPer})`);
    if (minPer) whereQuery.push(`(per >= ${minPer})`);
    if (minDy) whereQuery.push(`(dy >= ${minDy})`);
    if (vsHighPrice)
      whereQuery.push(
        `((yearMaxPrice-adjClose) >= ${vsHighPrice}/100 * yearMaxPrice)`,
      );
    if (vsLowPrice)
      whereQuery.push(
        `((adjClose-yearMinPrice) <= ${vsLowPrice}/100 * yearMinPrice)`,
      );
    // console.log(whereQuery);

    const res = await this.stockRepository.manager.query(
      `
      SELECT * FROM 
        (select * from KorStock where date = ?) k
      LEFT JOIN
        (SELECT MIN(adjClose) yearMinPrice, MAX(adjClose) yearMaxPrice, isin from KorStock 
        where date >= ? and date <= ? 
        group by isin) k2 on k.isin=k2.isin
      ${whereQuery.length > 0 ? `WHERE ${whereQuery.join(' AND ')}` : ''}
      order by marketCap desc
      limit 20
      `,
      [latestWorkDay, aYearAgo, latestWorkDay],
    );
    return res;
  }
}
