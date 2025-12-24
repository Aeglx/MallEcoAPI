import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './controllers/upload.controller';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController, CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}