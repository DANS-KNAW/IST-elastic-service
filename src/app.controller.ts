import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'create-index' })
  createIndex(
    @Payload() alias: string,
  ): Promise<{ message: string; alias: string; indice: string }> {
    return this.appService.createIndex(alias);
  }

  
}
