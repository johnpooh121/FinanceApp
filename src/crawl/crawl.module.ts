import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KorStockEntity } from 'src/entities/korStock.entity';
import { CrawlController } from './crawl.controller';
import { CrawlService } from './crawl.service';

@Module({
  imports: [TypeOrmModule.forFeature([KorStockEntity])],
  controllers: [CrawlController],
  providers: [CrawlService],
})
export class CrawlModule {}
