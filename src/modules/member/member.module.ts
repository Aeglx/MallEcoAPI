import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberController } from './controllers/member.controller';
import { MemberService } from './services/member.service';
import { MemberEntity } from './entities/member.entity';
import { MemberLevelEntity } from './entities/member-level.entity';
import { MemberAddressEntity } from './entities/member-address.entity';
import { MemberFootprintEntity } from './entities/member-footprint.entity';
import { MemberCollectionEntity } from './entities/member-collection.entity';
import { MemberExperienceLogEntity } from './entities/member-experience-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MemberEntity,
      MemberLevelEntity,
      MemberAddressEntity,
      MemberFootprintEntity,
      MemberCollectionEntity,
      MemberExperienceLogEntity,
    ]),
  ],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}