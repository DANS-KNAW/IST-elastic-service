import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService, ConfigType } from '@nestjs/config';
import rmqConfig, { CONFIG_RMQ } from './config/rmq.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const microConfig =
    configService.get<ConfigType<typeof rmqConfig>>(CONFIG_RMQ);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [microConfig.connectionUri],
    },
  });

  // await app.startAllMicroservices();

  /**
   * The `NestFactory.create()` method is currently necessary because `NestFactory.createMicroservice()`
   * does not provide an easy way to inject the `ConfigService`. Additionally, we cannot use
   * `NestFactory.create()` without calling `app.listen()`, as essential lifecycle hooks,
   * such as `OnModuleInit`, would not be triggered.
   *
   * These lifecycle hooks are crucial for properly managing the Elastic Search SDK.
   * As a result, the current solution involves using `app.listen()` on a random, unused port.
   *
   * Note: There are no HTTP routes in this application, so the port number is irrelevant
   * and will not be used for any network communication.
   */
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
