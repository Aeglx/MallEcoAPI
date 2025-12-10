import { Module } from '@nestjs/common';
import { BuyerContentController } from './content.controller';
import { ContentModule } from '../../common/content/content.module';

@Module({
  imports: [ContentModule],
  controllers: [BuyerContentController],
})
export class BuyerContentModule {}