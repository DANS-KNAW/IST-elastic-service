import { IndicesCreateResponse } from '@elastic/elasticsearch/lib/api/types';
import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async createIndex(alias: string): Promise<{
    message: string;
    alias: string;
    indice: string;
  }> {
    try {
      const exists = await this.elasticsearchService.indices.existsAlias({
        name: alias,
      });

      if (exists) {
        throw new RpcException('Alias already exists');
      }

      /**
       * The index name is created by appending a hyphen and a four-digit number to the alias.
       * This is used to manage versioning of the index for reindexing purposes.
       */
      const index = alias + '-0001';

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

      /**
       * This is similar to the previous check, but for the alias.
       */
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
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
