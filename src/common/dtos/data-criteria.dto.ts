import { ApiPropertyOptional } from '@nestjs/swagger';

export class DataCriteriaDTO {
  @ApiPropertyOptional({ description: '시가총액 하한' })
  minMarketCap: number;

  @ApiPropertyOptional({ description: '시가총액 상한' })
  maxMarketCap: number;

  @ApiPropertyOptional({ description: 'PER 하한' })
  minPer: number;

  @ApiPropertyOptional({ description: 'PER 상한' })
  maxPer: number;

  @ApiPropertyOptional({ description: 'PBR 하한' })
  minPbr: number;

  @ApiPropertyOptional({ description: 'PBR 상한' })
  maxPbr: number;

  @ApiPropertyOptional({ description: '배당수익률 하한' })
  minDy: number;

  @ApiPropertyOptional({ description: '52주 저점 대비 비율(%)' })
  vsLowPrice: number;

  @ApiPropertyOptional({ description: '52주 고점 대비 비율(%)' })
  vsHighPrice: number;
}
