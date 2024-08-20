import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'create-index' })
  createIndex(
    @Payload() payload: {alias: string, properties?: Record<string, any>},
  ): Promise<{ message: string; alias: string; indice: string }> {
    return this.appService.createIndex(payload.alias, payload.properties);
  }

  @MessagePattern({ cmd: 'index-document' })
  indexDocument(
    @Payload() payload: { alias: string; body: Record<string, any>, customId?: string },
  ): Promise<{ message: string }> {
    return this.appService.indexDocument(payload.alias, payload.body, payload.customId);
  }
}