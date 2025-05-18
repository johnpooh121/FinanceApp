import {
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CookieOptions, Request, Response } from 'express';
import { BE_HOST, FE_HOST, PROTOCOL, ROOT_DOMAIN } from 'src/common/constant';
import { AuthService } from './auth.service';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  defaultCookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    domain: ROOT_DOMAIN,
  };

  @Get('/kakao/callback')
  @ApiOperation({ description: '카카오 로그인 callback api' })
  @Redirect()
  async kakaoCallback(
    @Query('code') code,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = await this.authService.kakaoCallback(code);
    res.cookie(
      'finance-app-refresh-token',
      refreshToken,
      this.defaultCookieOptions,
    );

    return { url: `${PROTOCOL}://${BE_HOST}/web/mypage`, status: 302 };
  }

  @Post('/refresh')
  @ApiOperation({ description: 'refresh api (refresh token 필요)' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const oldRefreshToken = req.cookies['finance-app-refresh-token'];
      const { accessToken, refreshToken, bearerToken } =
        await this.authService.verifyAndRefresh(oldRefreshToken);
      res.cookie(
        'finance-app-access-token',
        accessToken,
        this.defaultCookieOptions,
      );
      res.cookie(
        'finance-app-refresh-token',
        refreshToken,
        this.defaultCookieOptions,
      );
      return bearerToken;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException();
    }
  }

  @Get('/google/oauth2')
  @ApiOperation({ description: 'google refresh token 발급' })
  async googleOauth2() {
    return this.authService.googleOauth2();
  }

  @Get('/google/callback')
  @ApiOperation({ description: '구글 로그인 callback api' })
  async googleCallback(@Query('code') code) {
    return this.authService.googleCallback(code);
  }

  @Get('/kakao/callback/next')
  @ApiOperation({ description: '카카오 로그인 callback api' })
  @Redirect()
  async kakaoCallbackForNextJs(
    @Query('code') code,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = await this.authService.kakaoCallback(code);
    res.cookie(
      'finance-app-refresh-token',
      refreshToken,
      this.defaultCookieOptions,
    );

    return { url: `${PROTOCOL}://${FE_HOST}/web/mypage`, status: 302 };
  }
}
