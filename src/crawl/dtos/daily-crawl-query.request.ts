import { ApiPropertyOptional } from '@nestjs/swagger';

export class DailyCrawlQueryRequest {
  @ApiPropertyOptional({
    description: '수집할 날짜 (YYYY-MM-DD), 없으면 오늘 날짜',
    example: '2025-02-28',
  })
  date?: string;
}
