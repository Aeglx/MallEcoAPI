import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from './entities/permission.entity';
import { UserRoleEntity } from './entities/user-role.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secretOrPrivateKey: process.env.JWT_SECRET || 'default_secret',
      signOptions: {
        expiresIn: '24h',
      },
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      PermissionEntity,
      UserRoleEntity,
      RolePermissionEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService],
  exports: [AuthService, UserService],
})
export class AuthModule {}