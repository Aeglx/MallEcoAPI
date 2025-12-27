import { Controller, applyDecorators } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

/**
 * API控制器装饰器，统一配置Swagger标签和认证
 * @param path 控制器路径
 * @param tag Swagger标签名称
 * @param auth 是否需要认证，默认为true
 */
export function ApiController(path: string, tag: string, auth: boolean = true) {
  return applyDecorators(Controller(path), ApiTags(tag), ...(auth ? [ApiBearerAuth('token')] : []));
}
