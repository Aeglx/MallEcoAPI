import { Module } from '@nestjs/common';
import { ImService } from './im.service';
import { ImController } from './im.controller';

@Module({
  controllers: [ImController],
  providers: [ImService],
})
export class ImModule {}
