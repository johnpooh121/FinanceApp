import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MetadataEntity } from 'src/entities/metadata.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(MetadataEntity)
    private readonly metadataRepo: Repository<MetadataEntity>,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const apiAuth = request.headers['admin-api-auth'] as string;

    if (!apiAuth) {
      throw new UnauthorizedException('no api-auth key');
    }

    const { value: originApiKey } = await this.metadataRepo.findOneByOrFail({
      key: 'admin-api-auth',
    });

    if (originApiKey !== apiAuth) {
      throw new ForbiddenException('Invalid api key');
    }
    return true;
  }
}
