import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      name: 'MallEco API',
      version: '1.0.0',
      description: '电商生态系统API',
      availableAPIs: {
        products: '/products',
        rbac: '/rbac',
        auth: '/auth',
        cart: '/cart',
        orders: '/orders',
        wallet: '/wallet',
        promotion: '/promotion',
        distribution: '/distribution',
        content: '/content',
        live: '/live',
        monitoring: '/monitoring'
      },
      documentation: '访问 /api 查看Swagger文档'
    };
  }
}
