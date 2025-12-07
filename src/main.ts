import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from 'common/filters/http-exception.filter';
import { TransformInterceptor } from 'common/interceptors/transform.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 应用全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // 应用全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // 启用 CORS
  app.enableCors();
  
  // 获取配置服务
  const configService = app.get(ConfigService);
  
  // 从环境变量获取端口
  const port = configService.get('PORT') || 3001;
  
  await app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
bootstrap();