import { ApiProperty } from '@nestjs/swagger';

export class IndividualCrawlQueryRequest {
  @ApiProperty({
    description: '수집할 종목의 단축코드',
    example: '005930',
  })
  code: string;
}
