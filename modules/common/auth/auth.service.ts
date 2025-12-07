import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 生成JWT令牌
   * @param payload - 令牌载荷
   * @returns JWT令牌
   */
  generateToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: 3600, // 1小时
    });
  }

  /**
   * 验证JWT令牌
   * @param token - JWT令牌
   * @returns 令牌载荷
   */
  verifyToken(token: string): any {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }
}
