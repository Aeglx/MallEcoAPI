import { Module } from '@nestjs/common';
import { SellerContentController } from './content.controller';
import { ContentModule } from '../../../client/common/content/content.module';

@Module({
  imports: [ContentModule],
  controllers: [SellerContentController],
})
export class SellerContentModule {}
