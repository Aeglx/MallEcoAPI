import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // 这里应该实现实际的管理员认证逻辑
    // 例如检查用户角色是否为管理员
    // 为了演示，暂时返回 true
    return true;
  }
}
