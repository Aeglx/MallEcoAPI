import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * WebSocket JWT认证守卫
 */
@Injectable()
export class WebSocketJwtGuard implements CanActivate {
  private readonly logger = new Logger(WebSocketJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();

    // 支持从query参数或Authorization header获取token
    let token = client.handshake.query?.accessToken as string;

    if (!token && client.handshake.headers?.authorization) {
      const authHeader = client.handshake.headers.authorization as string;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      this.logger.warn('WebSocket connection rejected: no token');
      throw new UnauthorizedException('No token provided');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
      const payload = this.jwtService.verify(token, {
        secret,
      });

      // 将用户信息附加到客户端对象
      client.user = {
        id: payload.sub || payload.id,
        username: payload.username,
        roles: payload.roles || [],
      };

      return true;
    } catch (error) {
      this.logger.warn('WebSocket connection rejected: invalid token', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
