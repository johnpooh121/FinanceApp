import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import expressBasicAuth from 'express-basic-auth';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { FE_HOST, SERVER_PORT } from './common/constant';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    ...(process.env.IS_LOCAL && {
      httpsOptions: {
        key: readFileSync('mydomain.key'),
        cert: readFileSync('mydomain.crt'),
      },
    }),
  });
  app.enableCors({
    origin: FE_HOST,
    methods: ['GET', 'POST'],
    credentials: true,
    // maxAge: 86400,
  });

  const config = new DocumentBuilder()
    .setTitle('Finance App API Reference')
    .setDescription('api reference')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', in: 'header', name: 'admin-api-auth' },
      'admin',
    )
    .addSecurityRequirements('admin')
    .build();

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.use(cookieParser());
  app.use(
    '/api',
    expressBasicAuth({
      users: {
        [process.env.SWAGGER_ID as string]: process.env.SWAGGER_PW as string,
      },
      challenge: true,
    }),
  );

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(SERVER_PORT);
}
bootstrap();
