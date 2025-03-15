import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import {
  ACCESS_TOKEN_SECRET,
  BEARER_TOKEN_SECRET,
  KAKAO_API_KEY,
  KAKAO_REDIRECT_URI,
  MAX_USER_COUNT,
  REFRESH_TOKEN_SECRET,
} from 'src/common/constant';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async kakaoCallback(code: string) {
    const res = await axios({
      url: 'https://kauth.kakao.com/oauth/token',
      method: 'POST',
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_API_KEY,
        redirect_uri: KAKAO_REDIRECT_URI,
        code,
      }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const { id_token } = res.data;

    const { sub } = this.jwtService.decode(id_token);

    const [user, total] = await Promise.all([
      this.userRepository.findOneBy({ id: sub }),
      this.userRepository.count({}),
    ]);

    if (total >= MAX_USER_COUNT)
      throw new NotFoundException('신규 가입이 불가능합니다');

    if (!user) {
      await this.userRepository.insert({ id: sub });
      console.log('new user registered, id : ', sub);
    } else {
      await this.userRepository.update({ id: sub }, { lastLogin: new Date() });
    }

    return this.issueRefreshToken(sub);
  }

  async verifyAndRefresh(oldRefreshToken: string) {
    const { id } = this.jwtService.verify(oldRefreshToken, {
      secret: REFRESH_TOKEN_SECRET,
    });
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException();
    return {
      accessToken: this.issueAccessToken(id),
      refreshToken: this.issueRefreshToken(id),
      bearerToken: this.issueBearerToken(id),
    };
  }

  issueAccessToken(id: string) {
    return this.jwtService.sign(
      { id },
      { secret: ACCESS_TOKEN_SECRET, expiresIn: 60 * 10 },
    );
  }

  issueBearerToken(id: string) {
    return this.jwtService.sign(
      { id },
      { secret: BEARER_TOKEN_SECRET, expiresIn: 60 * 10 },
    );
  }

  issueRefreshToken(id: string) {
    return this.jwtService.sign(
      { id },
      { secret: REFRESH_TOKEN_SECRET, expiresIn: 60 * 60 },
    );
  }
}
