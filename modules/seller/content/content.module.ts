import { Module } from '@nestjs/common';
import { SellerContentController } from './content.controller';
import { ContentModule } from '../../../common/content/content.module';

@Module({
  imports: [ContentModule],
  controllers: [SellerContentController],
})
export class SellerContentModule {}