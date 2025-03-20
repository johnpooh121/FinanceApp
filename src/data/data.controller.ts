import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { DataService } from './data.service';
import { DataRequestPostBody } from './dtos/request/data-request.post.body';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('/query/csv')
  @ApiOperation({ summary: 'db에서 데이터 불러와서 csv로 다운로드' })
  async getDataCsv(@Body() body: DataRequestPostBody, @Res() res: Response) {
    return this.dataService.getCSV(body, res);
  }
}
