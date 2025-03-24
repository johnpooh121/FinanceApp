import { ApiPropertyOptional } from '@nestjs/swagger';
import { DataCriteriaDTO } from 'src/common/dtos/data-criteria.dto';

export class PatchUserBody {
  @ApiPropertyOptional({ description: '이메일 구독 여부' })
  sub: boolean;

  @ApiPropertyOptional({ description: '이메일', nullable: true })
  email: string | null;

  @ApiPropertyOptional({ description: '이메일 구독 필터링 기준' })
  criteria: DataCriteriaDTO;
}
