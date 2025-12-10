import { Module } from '@nestjs/common';
import { ManagerContentController } from './content.controller';
import { ContentModule } from '../../common/content/content.module';

@Module({
  imports: [ContentModule],
  controllers: [ManagerContentController],
})
export class ManagerContentModule {}