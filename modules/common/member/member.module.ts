import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { MemberPoints } from './entities/member-points.entity';
import { MemberAddress } from './entities/member-address.entity';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, MemberPoints, MemberAddress]),
  ],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService, TypeOrmModule.forFeature([Member, MemberPoints, MemberAddress])],
})
export class MemberModule {}
