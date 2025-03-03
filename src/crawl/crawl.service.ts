import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KorStockEntity } from 'src/entities/korStock.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CrawlService {
  constructor(
    @InjectRepository(KorStockEntity)
    private readonly stockRepository: Repository<KorStockEntity>,
  ) {}

  async getDataByDate(hyphenDate: string) {
    console.log('collecting data by date : ', hyphenDate);
    const data = await this.stockRepository.find({ take: 3 });
    console.log(data);
  }
}
