import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule, {
    rawBody: true,
    bodyParser: true,
  });
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [`'self'`, 'data:', 'https: data:', 'apollo-server-landing-page.cdn.apollographql.com'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [`'self'`, 'apollo-server-landing-page.cdn.apollographql.com'],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    }),
  );
  app.use(graphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 10 }));

  app.use(compression());

  app.enableCors();

  app.useBodyParser('json', {
    bodyLimit: configService.get<number>('BODY_LIMIT'),
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  await app.listen(configService.get<number>('PORT'));
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
