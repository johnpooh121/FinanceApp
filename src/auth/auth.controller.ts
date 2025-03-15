import { Controller, Get, Query, Redirect, Res } from '@nestjs/common';
import { Response } from 'express';
import { MY_HOST } from 'src/common/constant';
import { AuthService } from './auth.service';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/kakao/callback')
  @Redirect()
  async kakaoCallback(
    @Query('code') code,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = await this.authService.kakaoCallback(code);
    response.cookie('finance-app-refresh-token', refreshToken);

    return { url: `http://${MY_HOST}/web/mypage`, status: 302 };
  }
}
