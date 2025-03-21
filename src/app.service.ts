import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    await this.dataSource.manager.query(`SET time_zone = '+00:00';`);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
