import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService, ConfigType } from '@nestjs/config';
import rmqConfig, { CONFIG_RMQ } from './config/rmq.config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  const microConfig =
    configService.get<ConfigType<typeof rmqConfig>>(CONFIG_RMQ);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [microConfig.connectionUri],
    },
  });

  await app.startAllMicroservices();

  app.useBodyParser('json', { limit: '10mb' });
  app.enableCors();

  await app.listen(3001);
}
bootstrap();
