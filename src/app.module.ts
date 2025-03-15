import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'reflect-metadata';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrawlModule } from './crawl/crawl.module';
import { UtilModule } from './util/util.module';
import { AuthModule } from './auth/auth.module';
import { WebModule } from './web/web.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    CrawlModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST, // todo : replace with configservice
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'finance',
      autoLoadEntities: true,
      timezone: 'UTC',
    }),
    UtilModule,
    AuthModule,
    WebModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
