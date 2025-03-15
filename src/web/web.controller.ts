import { Controller, Get, Render } from '@nestjs/common';
import { KAKAO_API_KEY, KAKAO_REDIRECT_URI } from 'src/common/constant';
import { WebService } from './web.service';

@Controller('web')
export class WebController {
  constructor(private readonly webService: WebService) {}

  @Get('/main')
  @Render('index')
  root() {
    return { message: 'Hello world!' };
  }

  @Get('/login')
  @Render('login')
  login() {
    return {
      clientId: KAKAO_API_KEY,
      redirectUri: KAKAO_REDIRECT_URI,
    };
  }

  @Get('/mypage')
  @Render('mypage')
  mypage() {
    return {
      clientId: KAKAO_API_KEY,
      redirectUri: KAKAO_REDIRECT_URI,
    };
  }
}
