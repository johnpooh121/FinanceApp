import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth, gmail_v1, google } from 'googleapis';
import { MONTHLY_QUOTA } from 'src/common/constant';
import { DataCriteriaDTO } from 'src/common/dtos/data-criteria.dto';
import { DataService } from 'src/data/data.service';
import { KorStockEntity } from 'src/entities/KorStock.entity';
import { MetadataEntity } from 'src/entities/metadata.entity';
import { UserEntity } from 'src/entities/user.entity';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(MetadataEntity)
    private readonly metadataRepository: Repository<MetadataEntity>,
    private readonly dataService: DataService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GCP_CLIENT_ID,
      process.env.GCP_CLIENT_SECRET,
    );
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  private readonly oauth2Client: Auth.OAuth2Client;

  private readonly gmail: gmail_v1.Gmail;

  async resetUserQuota() {
    await this.userRepository.update({}, { quota: MONTHLY_QUOTA });
  }

  buildCriteriaHtml(criteria: DataCriteriaDTO) {
    const texts: string[] = [];
    const {
      minMarketCap,
      maxMarketCap,
      minPer,
      maxPer,
      minPbr,
      maxPbr,
      minDy,
      vsLowPrice,
      vsHighPrice,
    } = criteria;
    if (minMarketCap || maxMarketCap)
      texts.push(
        `시가총액 ${minMarketCap ? `${minMarketCap}원 이상, ` : ''} ${maxMarketCap ? `${maxMarketCap}원 이하` : ''}`,
      );
    if (minPer || maxPer)
      texts.push(
        `PER ${minPer ? `${minPer} 이상, ` : ''} ${maxPer ? `${maxPer} 이하` : ''}`,
      );
    if (minPbr || maxPbr)
      texts.push(
        `PBR ${minPbr ? `${minPbr} 이상, ` : ''} ${maxPbr ? `${maxPbr} 이하` : ''}`,
      );
    if (minDy) texts.push(`배당수익률 ${minDy}% 이상`);
    if (vsLowPrice) texts.push(`52주 저점 대비 상승률 ${vsLowPrice}% 이하`);
    if (vsHighPrice) texts.push(`52주 고점 대비 하락률 ${vsHighPrice}% 이상`);
    return texts.map((row) => `&emsp;- ${row}`).join('<br>');
  }

  buildDataHtml(
    list: (KorStockEntity & { yearMaxPrice: number; yearMinPrice: number })[],
  ) {
    return list
      .map(
        ({
          code,
          name,
          adjClose,
          marketCap,
          per,
          pbr,
          dy,
          yearMinPrice,
          yearMaxPrice,
          foreignOwnRate,
        }) =>
          `<tr><td>${code}</td><td>${name}</td><td>${adjClose}</td><td>${yearMaxPrice}</td><td>${yearMinPrice}</td><td>${marketCap}</td><td>${per}</td><td>${pbr}</td><td>${dy}</td><td>${foreignOwnRate}</td></tr>`,
      )
      .join('');
  }

  buildEmailMessage(criteriaHtml: string, dataHtml: string, email: string) {
    const subject = '📊 설정한 조건의 주식 알림';
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: <${email}>`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      'This is a message just to say hello.',
      '<h2>내가 설정한 조건</h2>',
      criteriaHtml,
      '',
      '<h2>부합하는 종목</h2>',
      `<table id="table" border="1">
        <thead><td>종목코드</td><td>종목명</td><td>전일 종가</td><td>52주 최고가</td><td>52주 최저가</td><td>시가총액</td><td>PER</td><td>PBR</td><td>배당수익률</td><td>외국인지분율</td>
        </thead>
        <tbody id="table-body">
          ${dataHtml}
        </tbody>
      </table>`,
      '구독 관련 설정은 http://finance-app.ap-northeast-2.elasticbeanstalk.com/web/mypage 에서 수정하실 수 있습니다.',
      'So... <b>Hello!</b>  🤘❤️😎',
    ];
    const message = messageParts.join('\n');
    return message;
  }

  buildMessage() {
    const subject = '📊 설정한 조건의 주식 알림';
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      'To: <impooh121@naver.com>',
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      'This is a message just to say hello.',
      'So... <b>Hello!</b>  🤘❤️😎',
    ];
    const message = messageParts.join('\n');
    return message;
  }

  async refreshGmailClient() {
    try {
      console.log('trying to get access token with env refresh token');
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GCP_REFRESH_TOKEN,
      });
      await this.oauth2Client.getAccessToken();
    } catch (e) {
      try {
        console.log(e, 'failed to refresh with env token');
        const { value: refresh_token } =
          await this.metadataRepository.findOneByOrFail({
            key: 'refresh-token',
          });
        this.oauth2Client.setCredentials({ refresh_token });
        await this.oauth2Client.getAccessToken();
      } catch (e) {
        console.log(e, 'failed to refresh with saved token');
        return false;
      }
    }
    return true;
  }

  async sendEmail() {
    const res = await this.refreshGmailClient();
    if (!res) return false;
    const users = await this.userRepository.find({
      where: { sub: true, email: Not(IsNull()) },
    });
    for (const user of users) {
      await this.sendEmailToUser(user);
    }
  }

  async sendEmailToUser(user: UserEntity) {
    if (user.sub == false || user.email == null || user.criteria == null)
      return;
    const criteriaHtml = this.buildCriteriaHtml(user.criteria);
    const dataList = await this.dataService.getRecommend(user.criteria);
    const dataHtml = this.buildDataHtml(dataList);
    const emailMessage = this.buildEmailMessage(
      criteriaHtml,
      dataHtml,
      user.email,
    );
    const encodedMessage = Buffer.from(emailMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await this.gmail.users.messages.send({
      userId: 'me',

      requestBody: {
        raw: encodedMessage,
      },
    });
    console.log('gmail.send result : ', res.data);
  }

  async updateAccInfo() {
    await this.dataService.updateAccumulativeProperty();
  }
}
