import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiKeyService } from './api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToRpc().getData();
    const apiKey = request.apiKey;
    return this.apiKeyService.validateApiKey(apiKey);
  }

  // async (context: ExecutionContext): Promise<boolean> {
  //   const request = context.switchToHttp().getRequest();
  //   const apiKey = this.extractKeyFromHeader(request);
  //   if (!apiKey) {
  //     throw new UnauthorizedException();
  //   }
  //   const apiKeyEntityId = this.apiKeysService.extractIdFromApiKey(apiKey);
  //   try {
  //     const apiKeyEntity = await this.apiKeysRepository.findOne({
  //       where: { uuid: apiKeyEntityId },
  //       relations: { user: true },
  //     });
  //     await this.apiKeysService.validate(apiKey, apiKeyEntity.key);
  //     request[REQUEST_USER_KEY] = {
  //       sub: apiKeyEntity.user.id,
  //       email: apiKeyEntity.user.email,
  //       role: apiKeyEntity.user.role,
  //       permissions: apiKeyEntity.user.permissions,
  //     } as ActiveUserData;
  //   } catch {
  //     throw new UnauthorizedException();
  //   }
  //   return true;
  // }

  // private extractKeyFromHeader(request: Request): string | undefined {
  //   const [type, key] = request.headers.authorization?.split(' ') ?? [];
  //   return type === 'ApiKey' ? key : undefined;
  // }
}
