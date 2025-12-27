import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { initializeDatabase } from './database-init';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

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

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // 设置全局 API 前缀
    app.setGlobalPrefix('api');

    // 静态文件服务已在 app.module.ts 中通过 ServeStaticModule 配置

    // 应用全局异常过滤器
    app.useGlobalFilters(new HttpExceptionFilter());

    // 应用全局响应拦截器
    app.useGlobalInterceptors(new ResponseInterceptor());

    // 启用 CORS
    app.enableCors();

    // 配置 Swagger
    const swaggerConfigService = app.get(ConfigService);
    const swaggerPort = swaggerConfigService.get('PORT') || 9000;
    const nodeEnv = swaggerConfigService.get('NODE_ENV') || 'development';

    const swaggerConfig = new DocumentBuilder()
      .setTitle('MallEco API')
      .setDescription(
        `
# MallEco商城系统API文档

## 系统介绍
MallEco是一个功能完整的电商系统，支持多端（买家端、商家端、管理端）业务场景。

## 认证说明
大部分API需要JWT认证，请在请求头中添加：
\`\`\`
Authorization: Bearer <your-token>
\`\`\`

## 环境信息
- **当前环境**: ${nodeEnv}
- **API地址**: http://localhost:${swaggerPort}
- **文档版本**: v1.0

## 主要功能模块
- 用户认证与授权
- 商品管理
- 订单管理
- 支付管理
- 会员管理
- 促销营销
- 即时通讯
- 统计分析
      `,
      )
      .setVersion('1.0')
      .setContact('MallEco团队', 'https://github.com/malleco', 'support@malleco.com')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addServer(`http://localhost:${swaggerPort}`, '本地开发环境')
      .addServer(`http://0.0.0.0:${swaggerPort}`, '本地网络环境')
      .addServer('https://api-dev.malleco.com', '开发环境')
      .addServer('https://api.malleco.com', '生产环境')
      // 核心业务模块
      .addTag('认证', '用户认证与授权相关接口')
      .addTag('用户管理', '用户信息管理接口')
      .addTag('即时通讯', 'IM消息和WebSocket实时通讯接口')
      // 商品相关
      .addTag('商品', '商品信息管理接口')
      .addTag('商品分类', '商品分类管理接口')
      .addTag('购物车管理', '购物车操作接口')
      // 订单相关
      .addTag('订单管理', '订单创建、查询、管理接口')
      .addTag('支付管理', '支付相关接口')
      // 会员相关
      .addTag('会员管理', '会员信息管理接口')
      .addTag('钱包管理', '用户钱包和余额管理接口')
      // 营销相关
      .addTag('促销营销', '促销活动管理接口')
      .addTag('分销管理', '分销业务管理接口')
      .addTag('优惠券', '优惠券管理接口')
      // 内容相关
      .addTag('内容管理', '内容发布和管理接口')
      .addTag('直播管理', '直播功能接口')
      // 权限相关
      .addTag('角色管理', '角色管理接口')
      .addTag('权限管理', '权限管理接口')
      .addTag('部门管理', '部门管理接口')
      // 统计相关
      .addTag('销售统计', '销售数据统计接口')
      .addTag('订单统计', '订单数据统计接口')
      .addTag('用户统计', '用户数据统计接口')
      .addTag('财务统计', '财务数据统计接口')
      .addTag('仪表盘', '数据仪表盘接口')
      // 系统管理
      .addTag('系统管理', '系统配置和管理接口')
      .addTag('系统配置管理', '系统配置管理接口')
      .addTag('系统日志管理', '系统日志管理接口')
      .addTag('系统监控', '系统监控接口')
      .addTag('系统诊断管理', '系统诊断管理接口')
      .addTag('系统版本管理', '系统版本管理接口')
      .addTag('系统备份管理', '系统备份管理接口')
      // 基础设施
      .addTag('性能监控', '性能监控接口')
      .addTag('缓存管理', '缓存管理接口')
      .addTag('数据库管理', '数据库管理接口')
      .addTag('微服务管理', '微服务管理接口')
      .addTag('服务网格管理', '服务网格管理接口')
      .addTag('推荐模块', '推荐算法接口')
      // 其他
      .addTag('文件管理', '文件上传下载接口')
      .addTag('短信服务', '短信发送接口')
      .addTag('邮件服务', '邮件发送接口')
      .addTag('物流管理', '物流信息管理接口')
      .addTag('微信服务', '微信相关接口')
      .addTag('反馈管理', '用户反馈管理接口')
      .addTag('售后管理', '售后处理接口')
      .addTag('品牌', '品牌管理接口')
      .addTag('页面数据', '页面数据接口')
      .addTag('通用-文件上传', '通用文件上传接口')
      .addTag('通用', '通用接口')
      .addTag('地址管理', '地址管理接口')
      .addTag('交易管理', '交易管理接口')
      .addTag('店铺管理', '店铺管理接口')
      .addTag('搜索', '搜索功能接口')
      .addTag('监控仪表板', '监控仪表板接口')
      .addTag('健康检查', '健康检查接口')
      .addTag('菜单管理', '菜单管理接口')
      .addTag('统计管理', '统计管理接口')
      .addTag('公众号管理', '公众号管理接口')
      .addTag('公众号管理-消息管理', '公众号消息管理接口')
      .addTag('公众号管理-授权用户管理', '公众号授权用户管理接口')
      .addTag('公众号管理-授权令牌管理', '公众号授权令牌管理接口')
      .addTag('公众号管理-授权应用管理', '公众号授权应用管理接口')
      .addTag('公众号管理-自定义菜单', '公众号自定义菜单接口')
      .addTag('公众号管理-素材管理', '公众号素材管理接口')
      .addTag('公众号管理-H5网页', '公众号H5网页接口')
      .addTag('公众号管理-微信卡券', '公众号微信卡券接口')
      .addTag('卖家端-店铺设置', '卖家端店铺设置接口')
      .addTag('管理端-数据统计', '管理端数据统计接口')
      .addTag('管理端-系统设置', '管理端系统设置接口')
      .addTag('权限管理 - 菜单管理', '权限管理菜单管理接口')
      .addTag('通知管理', '通知管理接口')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: '输入JWT Token，格式：Bearer <token>',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    });

    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
        tryItOutEnabled: true,
      },
      customSiteTitle: 'MallEco API 文档',
      customfavIcon: '/favicon.ico',
    });

    // 获取配置服务
    const appConfigService = app.get(ConfigService);

    // 从环境变量获取端口
    const appPort = appConfigService.get('PORT') || 9000;
    console.log(`📝 配置的端口: ${appPort}`);

    await app.listen(appPort, '0.0.0.0', () => {
      console.log(`🚀 服务已启动在 http://localhost:${appPort}`);
      console.log(`🌐 服务已启动在 http://0.0.0.0:${appPort} (可从外部访问)`);
      console.log(`📖 Swagger文档可用在 http://localhost:${appPort}/api-docs`);
      console.log(`📖 Swagger文档可用在 http://0.0.0.0:${appPort}/api-docs (可从外部访问)`);

      // 打印模块信息
      printModuleInfo(appConfigService);
    });

    console.log('✅ 应用程序启动成功');
  } catch (error) {
    console.error('❌ 应用程序启动失败:', error);
    process.exit(1);
  }
}
bootstrap();
