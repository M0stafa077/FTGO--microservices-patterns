import 'reflect-metadata';

import { Environment } from '@ftgo/common/infrastructure';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module.js';
import { AppConfig } from './config/app.config.js';

async function bootstrap(): Promise<void> {
  const config = AppConfig.fromEnvironment(new Environment(process.env));
  const app = await NestFactory.create<NestExpressApplication>(AppModule.with(config), {
    bufferLogs: true,
    bodyParser: false,
  });
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.disable('x-powered-by');
  app.enableShutdownHooks();
  await app.listen(config.port);
}

void bootstrap();
