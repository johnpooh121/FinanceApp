import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DataRequestPostBody {
  @ApiProperty({ description: '조회기간 시작일', example: '2025-01-01' })
  startDate: string;

  @ApiProperty({ description: '조회기간 종료일', example: '2025-01-07' })
  endDate: string;

  @ApiProperty({
    description: '조회할 종목 단축코드(\n으로 연결)',
    example: '005930\n000660',
  })
  codes: string;

  @ApiPropertyOptional({ description: '전체 종목 조회인지', example: 'on' })
  isAllIssue: 'on';
}
