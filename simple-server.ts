import { NestFactory } from '@nestjs/core';
import { Module, Controller, Get } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// 创建一个简单的控制器
@Controller()
export class SimpleController {
  @Get()
  getStatus() {
    return {
      message: 'Server is running',
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }
  
  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      components: {
        server: 'ok',
        database: 'not_connected',
        cache: 'not_connected'
      }
    };
  }
}

// 创建一个最小化的模块
@Module({
  controllers: [SimpleController]
})
export class SimpleModule {}

async function bootstrap() {
  try {
    const app = await NestFactory.create(SimpleModule);
    
    // 启用 CORS
    app.enableCors();
    
    // 配置 Swagger
    const swaggerConfig = new DocumentBuilder()
      .setTitle('MallEco API')
      .setDescription('MallEco商城系统API文档')
      .setVersion('1.0')
      .addTag('system', '系统管理')
      .build();
    
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, document);
    
    const port = 3001;
    
    await app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // 创建一个简单的HTTP服务器作为备用
    const http = require('http');
    const port = 3001;
    
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Server is running, but database connection failed',
        status: 'partial',
        timestamp: new Date().toISOString()
      }));
    });
    
    server.listen(port, () => {
      console.log(`Backup server running on http://localhost:${port}`);
    });
  }
}

bootstrap();
