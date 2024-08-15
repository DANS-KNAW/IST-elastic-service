import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import validationSchema from './config/validation-schema';
import commonConfig from './config/common.config';
import rmqConfig from './config/rmq.config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import esConfig, { CONFIG_ES } from './config/es.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      envFilePath: ['.env.local', '.env.development', '.env.production'],
      ignoreEnvVars: true,
      load: [commonConfig, rmqConfig, esConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: false,
        abortEarly: true,
      },
    }),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config =
          configService.get<ConfigType<typeof esConfig>>(CONFIG_ES);

        return {
          nodes: config.poolEndpoints,
          auth: {
            apiKey: config.apiKey,
          },
          tls: {
            rejectUnauthorized: config.rejectUnauthorized,
          },
          maxRetries: 3,
          requestTimeout: 20000,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
