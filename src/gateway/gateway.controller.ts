import { Controller, All, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { GatewayService, LoadBalancingStrategy } from './gateway.service';

@Controller('api')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @All('*')
  async handleRequest(@Req() req: Request, @Res() res: Response) {
    try {
      // 从请求头获取服务名称和负载均衡策略
      const serviceName = req.headers['x-service-name'] as string;
      const strategy = (req.headers['x-load-balancing-strategy'] as LoadBalancingStrategy) || 'round-robin';

      if (!serviceName) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Missing x-service-name header',
        });
      }

      // 提取请求路径（去掉/api前缀）
      const path = req.originalUrl.replace(/^\/api/, '');

      // 发送请求到目标服务
      const response = await this.gatewayService.requestService(
        serviceName,
        path,
        req.method,
        req.body,
        {
          headers: req.headers,
          params: req.query,
        },
        strategy,
      );

      // 返回响应
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      console.error('Gateway error:', error);
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: error.message || 'Internal server error',
      });
    }
  }
}
