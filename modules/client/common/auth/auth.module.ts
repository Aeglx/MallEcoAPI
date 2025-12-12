import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserController } from './controllers/user.controller';
import { RoleController } from './controllers/role.controller';
import { PermissionController } from './controllers/permission.controller';
import { MenuController } from './controllers/menu.controller';
import { UserService } from './services/user.service';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { MenuService } from './services/menu.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Menu } from './entities/menu.entity';
import { Department } from './entities/department.entity';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: 3600, // 1小时
        },
      }),
    }),
    TypeOrmModule.forFeature([User, Role, Permission, Menu, Department]),
  ],
  controllers: [
    AuthController,
    UserController,
    RoleController,
    PermissionController,
    MenuController
  ],
  providers: [
    AuthService,
    UserService,
    RoleService,
    PermissionService,
    MenuService,
    JwtStrategy
  ],
  exports: [
    AuthService,
    UserService,
    RoleService,
    PermissionService,
    MenuService,
    JwtModule,
    PassportModule,
    TypeOrmModule.forFeature([User, Role, Permission, Menu, Department])
  ],
})
export class AuthModule {}
