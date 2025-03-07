import { Controller, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import moment from 'moment-timezone';
import { CrawlService } from './crawl.service';
import { DailyCrawlQueryRequest } from './dtos/daily-crawl-query.request';
import { IndividualCrawlQueryRequest } from './dtos/individual-crawl-query.request';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Post('/daily')
  @ApiOperation({ summary: '일일 한국 주식 데이터 크롤링' })
  async updateStockDaily(@Query() query: DailyCrawlQueryRequest) {
    const { date } = query;
    const hyphenDate = moment.utc(date ?? new Date()).format('YYYY-MM-DD');
    return this.crawlService.updateDataByDate(hyphenDate);
  }

  @Post('/basic-info')
  @ApiOperation({ summary: '한국 증권 종목 별 기본정보 데이터 크롤링' })
  async updateStockBasicInfo() {
    return this.crawlService.updateBasicInfo();
  }

  @Post('/individual')
  @ApiOperation({ summary: '개별 종목 데이터 크롤링' })
  async updateIndividualStock(@Query() query: IndividualCrawlQueryRequest) {
    return this.crawlService.updateIndividualStock(query);
  }

  @Post('/init')
  @ApiOperation({ summary: '초기 데이터 채우기' })
  async initializeDB() {
    return this.crawlService.initializeDB();
  }
}
