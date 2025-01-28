import {
  IndicesCreateResponse,
  MappingTypeMapping,
} from '@elastic/elasticsearch/lib/api/types';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RpcException } from '@nestjs/microservices';
import esConfig from './config/es.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject(esConfig.KEY)
    private readonly config: ConfigType<typeof esConfig>,

    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async createIndex(
    alias: string,
    mappings?: MappingTypeMapping,
  ): Promise<{
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
          mappings: mappings ?? undefined,
          settings: {
            number_of_shards: this.config.poolEndpoints.length, // We set the number of shards to the number of nodes in the cluster.
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
      throw new RpcException(error.message);
    }
  }

  async indexDocument(
    alias: string,
    document: Record<string, any>,
    customId?: string,
  ): Promise<{ message: string }> {
    const exists = await this.elasticsearchService.indices.existsAlias({
      name: alias,
    });

    if (!exists) {
      throw new RpcException('Alias does not exist');
    }

    let id: string | undefined;
    if (customId) {
      id = document[customId];
    }

    const indexed = await this.elasticsearchService.index({
      index: alias,
      body: document,
      id: id,
    });

    if (indexed.result != 'created' && indexed.result != 'updated') {
      throw new RpcException('Failed to index document');
    }

    return {
      message: 'Document successfully indexed',
    };
  }

  async getAllIndexDocuments(index: string, query: object) {
    const exists = await this.elasticsearchService.indices.existsAlias({
      name: index,
    });

    if (!exists) {
      throw new NotFoundException('Index does not exist');
    }

    const documents = await this.elasticsearchService.search({
      index: index,
      ...query,
    });

    return documents;
  }

  async getDocument(index: string, documentIdentifier: string, query: object) {
    console.log(query);
    const exists = await this.elasticsearchService.indices.existsAlias({
      name: index,
    });

    if (!exists) {
      throw new NotFoundException('Index does not exist');
    }

    try {
      const document = await this.elasticsearchService.get<unknown>({
        index: index,
        id: documentIdentifier,
        ...query,
      });

      if (!document || !document.found || !document._source) {
        throw new NotFoundException('Document not found');
      }

      return document._source;
    } catch (error) {
      console.log(error);

      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.meta?.statusCode === 404) {
        throw new NotFoundException('Document not found');
      }
      throw error;
    }
  }
}
