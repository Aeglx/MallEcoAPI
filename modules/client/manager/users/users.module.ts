import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../../src/modules/users/entities/user.entity';
import { ManagerUsersController } from './users.controller';
import { ManagerUsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [ManagerUsersController],
  providers: [ManagerUsersService],
  exports: [ManagerUsersService],
})
export class ManagerUsersModule {}
