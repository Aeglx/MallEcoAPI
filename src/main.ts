import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { initializeDatabase } from './database-init';

async function bootstrap() {
  try {
    // 在应用启动前执行数据库初始化
    console.log('🚀 启动数据库初始化检查...');
    const dbInitSuccess = await initializeDatabase();
    
    if (!dbInitSuccess) {
      console.log('⚠️ 数据库初始化失败，应用仍将继续启动，但数据库功能可能不可用');
    }

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose']
    });
    
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
      .addTag('认证', '用户认证与授权')
      .addTag('用户管理', '用户管理')
      .addTag('角色管理', '角色管理')
      .addTag('权限管理', '权限管理')
      .addTag('部门管理', '部门管理')
      .addTag('商品管理', '商品管理')
      .addTag('购物车管理', '购物车管理')
      .addTag('订单管理', '订单管理')
      .addTag('钱包管理', '钱包管理')
      .addTag('促销营销', '促销营销')
      .addTag('分销管理', '分销管理')
      .addTag('直播管理', '直播管理')
      .addTag('内容管理', '内容管理')
      .addTag('销售统计', '销售统计')
      .addTag('订单统计', '订单统计')
      .addTag('用户统计', '用户统计')
      .addTag('财务统计', '财务统计')
      .addTag('仪表盘', '仪表盘')
      .addTag('系统管理', '系统管理')
      .addTag('性能监控', '性能监控')
      .addTag('缓存管理', '缓存管理')
      .addTag('数据库管理', '数据库管理')
      .addTag('微服务管理', '微服务管理')
      .addTag('服务网格管理', '服务网格管理')
      .addTag('推荐模块', '推荐模块')
      .addTag('系统配置管理', '系统配置管理')
      .addTag('系统日志管理', '系统日志管理')
      .addTag('系统监控', '系统监控')
      .addTag('系统诊断管理', '系统诊断管理')
      .addTag('系统版本管理', '系统版本管理')
      .addTag('系统备份管理', '系统备份管理')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization'
      }, 'JWT-auth')
      .build();
    
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        language: 'zh-cn',
        persistAuthorization: true,
      },
    });
    
    // 获取配置服务
    const configService = app.get(ConfigService);
    
    // 从环境变量获取端口
    const port = configService.get('PORT') || 3001;
    console.log(`📝 配置的端口: ${port}`);
    
    await app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 服务已启动在 http://localhost:${port}`);
      console.log(`📖 Swagger文档可用在 http://localhost:${port}/api-docs`);
    });
    
    console.log('✅ 应用程序启动成功');
  } catch (error) {
    console.error('❌ 应用程序启动失败:', error);
    process.exit(1);
  }
}
bootstrap();