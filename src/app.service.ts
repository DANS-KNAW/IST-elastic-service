import { IndicesCreateResponse } from '@elastic/elasticsearch/lib/api/types';
import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createIndex(alias: string) {
    const exists = await this.elasticsearchService.indices.existsAlias({
      name: alias,
    });

    if (exists) {
      throw new RpcException('Alias already exists');
    }

    const index = alias + '_v1';

    const indice = await this.elasticsearchService.indices
      .create({
        index,
        settings: {
          number_of_shards: 3,
          number_of_replicas: 1,
        },
      })
      .catch((error: Error) => {
        if (!error.message.includes('Request timed out')) {
          throw new RpcException('Failed to create index');
        }
        return {
          acknowledged: false,
        } as IndicesCreateResponse;
      });

    /**
     * The Elastic Search SDK can timeout if a request takes too long to complete.
     * The issue is that even if a request times out, the index might still be created.
     * To handle this, we check if the index exists after the request times out.
     */
    if (indice.acknowledged != true) {
      const exists = await this.elasticsearchService.indices.exists({
        index,
      });

      if (!exists) {
        throw new RpcException('Failed to create index');
      }
    }

    const aliasIndice = await this.elasticsearchService.indices
      .putAlias({
        index,
        name: alias,
      })
      .catch((error: Error) => {
        if (!error.message.includes('Request timed out')) {
          throw new RpcException('Failed to create alias');
        }
        return {
          acknowledged: false,
        } as IndicesCreateResponse;
      });

    if (!aliasIndice.acknowledged) {
      const exists = await this.elasticsearchService.indices.existsAlias({
        name: alias,
      });
      if (!exists) {
        throw new RpcException('Failed to create alias');
      }
    }

    return {
      message: 'Alias successfully created',
      alias,
      indice: index,
    };
  }
}
