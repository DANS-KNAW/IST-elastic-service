import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import validationSchema from './config/validation-schema';
import commonConfig from './config/common.config';
import rmqConfig from './config/rmq.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      envFilePath: ['.env.local', '.env.development', '.env.production'],
      ignoreEnvVars: true,
      load: [commonConfig, rmqConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: false,
        abortEarly: true,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
