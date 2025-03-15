import { ApiProperty } from '@nestjs/swagger';

export class PatchUserBody {
  @ApiProperty({ description: '이메일', nullable: true })
  email: string | null;
}
