import { Controller, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import moment from 'moment-timezone';
import { CrawlService } from './crawl.service';
import { DailyCrawlQueryRequest } from './dtos/daily-crawl-query.request';
import { IndividualCrawlQueryRequest } from './dtos/individual-crawl-query.request';
import { CrawlDividendService } from './services/crawl-dividend.service';
import { CrawlForeignOwnService } from './services/crawl-foreign-own.service';
import { CrawlInfoService } from './services/crawl-info.service';
import { CrawlOhlcvService } from './services/crawl-ohlcv.service';

@Controller('crawl')
export class CrawlController {
  constructor(
    private readonly crawlService: CrawlService,
    private readonly crawlOhlcv: CrawlOhlcvService,
    private readonly crawlDividend: CrawlDividendService,
    private readonly crawlInfo: CrawlInfoService,
    private readonly crawlForeignOwn: CrawlForeignOwnService,
  ) {}

  @Post('/daily')
  @ApiOperation({ summary: '일일 한국 주식 데이터 크롤링' })
  async updateStockDaily(@Query() query: DailyCrawlQueryRequest) {
    const { date } = query;
    let hyphenDate = date;
    if (!hyphenDate) {
      const now = moment.tz('Asia/Seoul');
      if (now.hour() < 16) now.subtract({ day: 1 });
      hyphenDate = now.format('YYYY-MM-DD');
    }

    return this.crawlService.crawlDaily(hyphenDate);
  }

  @Post('/basic-info')
  @ApiOperation({ summary: '한국 증권 종목 별 기본정보 데이터 크롤링' })
  async updateStockBasicInfo() {
    return this.crawlInfo.updateBasicInfo();
  }

  @Post('/individual')
  @ApiOperation({ summary: '개별 종목 데이터 크롤링' })
  async updateIndividualStock(@Query() query: IndividualCrawlQueryRequest) {
    return this.crawlOhlcv.updateOhlcvByCode(query);
  }

  @Post('/init')
  @ApiOperation({ summary: '초기 데이터 채우기' })
  async initializeDB() {
    return this.crawlService.initializeDB();
  }
}
