import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { initializeDatabase } from './database-init';

async function bootstrap() {
  // 在应用启动前执行数据库初始化
  console.log('🚀 启动数据库初始化检查...');
  const dbInitSuccess = await initializeDatabase();
  
  if (!dbInitSuccess) {
    console.log('⚠️ 数据库初始化失败，应用仍将继续启动，但数据库功能可能不可用');
  }

  const app = await NestFactory.create(AppModule);
  
  // 应用全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // 应用全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());
  
  // 启用 CORS
  app.enableCors();
  
  // 配置 Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MallEco API')
    .setDescription('MallEco商城系统API文档')
    .setVersion('1.0')
    .addTag('auth', '用户认证与授权')
    .addTag('users', '用户管理')
    .addTag('roles', '角色管理')
    .addTag('permissions', '权限管理')
    .addTag('products', '商品管理')
    .addTag('cart', '购物车管理')
    .addTag('orders', '订单管理')
    .addTag('wallet', '钱包管理')
    .addTag('promotion', '促销营销')
    .addTag('distribution', '分销管理')
    .addTag('live', '直播管理')
    .addTag('content', '内容管理')
    .addTag('statistics', '统计报表')
    .addTag('system', '系统管理')
    .addTag('performance', '性能监控')
    .addTag('cache', '缓存管理')
    .addTag('database', '数据库管理')
    .addTag('microservices', '微服务管理')
    .addTag('service-mesh', '服务网格管理')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization'
    }, 'JWT-auth')
    .build();
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);
  
  // 获取配置服务
  const configService = app.get(ConfigService);
  
  // 从环境变量获取端口
  const port = configService.get('PORT') || 3001;
  
  await app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
  });
}
bootstrap();