import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.createIndex('anime');
  }

  @MessagePattern({ cmd: 'create-index' })
  createIndex(
    @Payload() alias: string,
  ): Promise<{ message: string; alias: string; indice: string }> {
    return this.appService.createIndex(alias);
  }
}
