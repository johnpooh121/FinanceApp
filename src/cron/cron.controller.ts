import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { CronService } from './cron.service';

@Controller('cron')
@UseGuards(AdminGuard)
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Post('/reset-quota')
  @ApiOperation({ description: '유저 월별 quota 초기화' })
  async resetUserQuota() {
    return this.cronService.resetUserQuota();
  }

  @Post('/send-email')
  @ApiOperation({ description: '유저에게 이메일 발송' })
  async sendEmail() {
    return this.cronService.sendEmail();
  }

  @Post('/data/update-acc-properties')
  @ApiOperation({ description: '누적되는 속성들 업데이트' })
  async updateAccProperties() {
    return this.cronService.updateAccInfo();
  }
}
