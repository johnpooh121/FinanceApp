import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { UserId } from 'src/common/decorators/user.decorator';
import { DataCriteriaDTO } from 'src/common/dtos/data-criteria.dto';
import { UserGuard } from 'src/common/guards/user.guard';
import { KorStockEntity } from 'src/entities/KorStock.entity';
import { DataService } from './data.service';
import { DataRequestPostBody } from './dtos/request/data-request.post.body';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('/query/csv')
  @ApiOperation({ summary: 'db에서 데이터 불러와서 csv로 다운로드' })
  @UseGuards(UserGuard)
  async getDataCsv(
    @Body() body: DataRequestPostBody,
    @UserId() userId: string,
    @Res() res: Response,
  ) {
    return this.dataService.getCSV(body, userId, res);
  }

  @Post('/recommend')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '조건에 맞는 종목 출력' })
  async getRecommend(
    @Body() body: DataCriteriaDTO,
  ): Promise<
    (KorStockEntity & { yearMaxPrice: number; yearMinPrice: number })[]
  > {
    return this.dataService.getRecommend(body);
  }
}
