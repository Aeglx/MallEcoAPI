import { Module } from '@nestjs/common';
import { MemberBuyerController } from './controllers/member.controller';
import { MemberService } from './services/member.service';

@Module({
  controllers: [MemberBuyerController],
  providers: [MemberService],
})
export class PassportModule {}
