import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_SECRET, BEARER_TOKEN_SECRET } from '../constant';

@Injectable()
export class UserGuard implements CanActivate {
  jwtService = new JwtService();
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    try {
      const accessTokenCookie = req.cookies['finance-app-access-token'];
      const bearerToken =
        req.headers['Authorization'] || req.headers['authorization'];
      this.jwtService.verify(accessTokenCookie, {
        secret: ACCESS_TOKEN_SECRET,
      });
      const { id } = this.jwtService.verify(bearerToken, {
        secret: BEARER_TOKEN_SECRET,
      });
      req.id = id;
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
