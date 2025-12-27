import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { UploadController } from './controllers/upload.controller';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register({
      ttl: 300, // 默认5分钟
      max: 100, // 最大缓存项数
    }),
  ],
  controllers: [UploadController, CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
