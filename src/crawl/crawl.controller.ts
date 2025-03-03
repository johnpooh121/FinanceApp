import { Controller, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import moment from 'moment-timezone';
import { CrawlService } from './crawl.service';
import { DailyCrawlQueryRequest } from './dtos/daily-crawl-query.request';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Post('/daily')
  @ApiOperation({ summary: '일일 한국 주식 데이터 크롤링' })
  async getEventsAndReviewsCount(@Query() query: DailyCrawlQueryRequest) {
    const { date } = query;
    const hyphenDate = moment.utc(date ?? new Date()).format('YYYY-MM-DD');
    return this.crawlService.getDataByDate(hyphenDate);
  }
}
