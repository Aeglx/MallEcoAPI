import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './controllers/upload.controller';
import { CommonController } from './common.controller';
import { RegionController } from './controllers/region.controller';
import { CommonService } from './common.service';
import { RegionService } from './services/region.service';
import { Region } from '../framework/entities/region.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Region]),
    CacheModule.register({
      ttl: 300, // 默认5分钟
      max: 100, // 最大缓存项数
    }),
  ],
  controllers: [UploadController, CommonController, RegionController],
  providers: [CommonService, RegionService],
  exports: [CommonService, RegionService],
})
export class CommonModule {}
