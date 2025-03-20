import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'reflect-metadata';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CrawlModule } from './crawl/crawl.module';
import { UserModule } from './user/user.module';
import { UtilModule } from './util/util.module';
import { WebModule } from './web/web.module';
import { DataModule } from './data/data.module';

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
    DataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
