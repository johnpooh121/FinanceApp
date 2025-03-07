import { ApiPropertyOptional } from '@nestjs/swagger';
import { KorMarketType } from 'src/common/enum';

export class IndividualCrawlQueryRequest {
  @ApiPropertyOptional({
    description: '수집할 종목의 ISIN',
    example: 'KR7005930003',
  })
  isin?: string;

  @ApiPropertyOptional({
    description: '수집할 종목의 단축코드',
    example: '005930',
  })
  code?: string;

  @ApiPropertyOptional({
    description: '수집할 종목의 거래시장 타입',
    example: KorMarketType.KOSPI,
  })
  marketType?: KorMarketType;
}
