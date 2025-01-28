import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { AppService } from './app.service';
// import { MessagePattern, Payload } from '@nestjs/microservices';
// import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @MessagePattern({ cmd: 'create-index' })
  // createIndex(
  //   @Payload()
  //   payload: {
  //     alias: string;
  //     mappings?: MappingTypeMapping;
  //   },
  // ): Promise<{ message: string; alias: string; indice: string }> {
  //   return this.appService.createIndex(payload.alias, payload.mappings);
  // }

  // @MessagePattern({ cmd: 'index-document' })
  // indexDocument(
  //   @Payload()
  //   payload: {
  //     alias: string;
  //     body: Record<string, any>;
  //     customId?: string;
  //   },
  // ): Promise<{ message: string }> {
  //   return this.appService.indexDocument(
  //     payload.alias,
  //     payload.body,
  //     payload.customId,
  //   );
  // }

  @Get()
  getHello(): string {
    return 'Proxy This!';
  }

  @Post(':index/_search')
  getAllDocuments(
    @Param('index') index: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.appService.getAllIndexDocuments(index, req.body);
  }

  @Post(':index/_source/:document')
  getDocument(
    @Param('index') index: string,
    @Param('document') document: string,
    @Body() body: any,
  ) {
    return this.appService.getDocument(index, document, body);
  }
}
