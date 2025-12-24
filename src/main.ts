import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { initializeDatabase } from './database-init';

function printModuleInfo(configService: ConfigService) {
  const rabbitmqEnabled = configService.get('RABBITMQ_ENABLED') === 'true';
  const redisHost = configService.get('REDIS_HOST');
  const redisEnabled = redisHost && redisHost !== 'localhost';
  const elasticsearchEnabled = configService.get('ELASTICSEARCH_NODE') !== 'http://localhost:9200';
  const consulEnabled = configService.get('CONSUL_HOST') !== 'localhost';
  
  console.log('');
  console.log(' 📋 应用模块信息: ');
  console.log(' ├── 权限管理模块 ✅ 已启用 ');
  console.log(' ├── 商品管理模块 ✅ 已启用 ');
  console.log(' ├── 购物车模块 ✅ 已启用 ');
  console.log(' ├── 订单管理模块 ✅ 已启用 ');
  console.log(' ├── 钱包系统模块 ✅ 已启用 ');
  console.log(' ├── 促销营销模块 ✅ 已启用 ');
  console.log(' ├── 分销系统模块 ✅ 已启用 ');
  console.log(' ├── 内容管理模块 ✅ 已启用 ');
  console.log(' ├── 直播模块 ✅ 已启用 ');
  console.log(' ├── 支付模块 ✅ 已启用 ');
  console.log(' ├── 短信模块 ✅ 已启用 ');
  console.log(' ├── 邮件模块 ✅ 已启用 ');
  console.log(' ├── 文件管理模块 ✅ 已启用 ');
  console.log(' ├── 买家模块 ✅ 已启用 ');
  console.log(' ├── 商家模块 ✅ 已启用 ');
  console.log(' ├── 管理后台模块 ✅ 已启用 ');
  console.log(' ├── 即时通讯模块 ✅ 已启用 ');
  console.log(' ├── 地址管理模块 ✅ 已启用 ');
  console.log(' ├── 会员管理模块 ✅ 已启用 ');
  console.log(' ├── 店铺管理模块 ✅ 已启用 ');
  console.log(' ├── 交易模块 ✅ 已启用 ');
  console.log(' ├── 微信模块 ✅ 已启用 ');
  console.log(' ├── 物流模块 ✅ 已启用 ');
  console.log(' ├── 反馈模块 ✅ 已启用 ');
  console.log(' ├── 通用模块 ✅ 已启用 ');
  console.log(` ├── 消息队列模块 ${rabbitmqEnabled ? '✅ 已启用' : '⚠️ 未配置'} `);
  console.log(` ├── 缓存模块 ${redisEnabled ? '✅ 已启用' : '⚠️ 未配置'} `);
  console.log(` ├── 搜索模块 ${elasticsearchEnabled ? '✅ 已启用' : '⚠️ 未配置'} `);
  console.log(` └── 服务发现模块 ${consulEnabled ? '✅ 已启用' : '⚠️ 未配置'} `);
  console.log('');
  console.log(' 🔧 技术栈: ');
  console.log(' ├── 框架: NestJS + TypeScript ');
  console.log(' ├── 数据库: MySQL + TypeORM ');
  console.log(` ├── 缓存: ${redisEnabled ? 'Redis' : '内存缓存'} `);
  console.log(` ├── 消息队列: ${rabbitmqEnabled ? 'RabbitMQ' : '内存队列'} `);
  console.log(` ├── 搜索: ${elasticsearchEnabled ? 'Elasticsearch' : '数据库搜索'} `);
  console.log(' ├── 认证: JWT + Passport ');
  console.log(' ├── 文档: Swagger ');
  console.log(` ├── 服务发现: ${consulEnabled ? 'Consul' : '静态配置'} `);
  console.log(' └── 部署: Docker + PM2 ');
  console.log('');
  console.log(' 🎯 可用API端点: ');
  console.log(' ├── 买家API: /api/buyer/* ');
  console.log(' ├── 商家API: /api/seller/* ');
  console.log(' ├── 管理API: /api/manager/* ');
  console.log(' ├── 通用API: /api/common/* ');
  console.log(' ├── 权限API: /api/auth/* ');
  console.log(' ├── 商品API: /api/goods/* ');
  console.log(' ├── 订单API: /api/orders/* ');
  console.log(' ├── 支付API: /api/payment/* ');
  console.log(' ├── 钱包API: /api/wallet/* ');
  console.log(' ├── 促销API: /api/promotion/* ');
  console.log(' ├── 分销API: /api/distribution/* ');
  console.log(' ├── 内容API: /api/content/* ');
  console.log(' ├── 直播API: /api/live/* ');
  console.log(' ├── 文件API: /api/file/* ');
  console.log(' ├── 短信API: /api/sms/* ');
  console.log(' ├── 邮件API: /api/email/* ');
  console.log(' ├── 物流API: /api/logistics/* ');
  console.log(' ├── 即时通讯API: /api/im/* ');
  console.log(' ├── 微信API: /api/wechat/* ');
  console.log(' └── 统计API: /api/statistics/* ');
  console.log('');
  console.log(' 🚀 开发命令: ');
  console.log(' ├── 启动开发: npm run start:dev ');
  console.log(' ├── 构建生产: npm run build ');
  console.log(' ├── 启动生产: npm run start:prod ');
  console.log(' ├── 数据库初始化: npm run db:init ');
  console.log(' ├── 菜单初始化: npm run menu:init ');
  console.log(' ├── 微信菜单: npm run wechat:show ');
  console.log(' ├── 代码检查: npm run lint ');
  console.log(' └── 测试: npm run test ');
  console.log('');
}

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
      
      // 打印模块信息
      printModuleInfo(configService);
    });
    
    console.log('✅ 应用程序启动成功');
  } catch (error) {
    console.error('❌ 应用程序启动失败:', error);
    process.exit(1);
  }
}
bootstrap();