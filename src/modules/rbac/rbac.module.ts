import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Menu } from './entities/menu.entity';
import { Department } from './entities/department.entity';
import { UserRole } from './entities/user-role.entity';
import { RolePermission } from './entities/role-permission.entity';

import { UserService } from './services/user.service';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { MenuService } from './services/menu.service';
import { DepartmentService } from './services/department.service';

import { UserController } from './controllers/user.controller';
import { RoleController } from './controllers/role.controller';
import { PermissionController } from './controllers/permission.controller';
import { MenuController } from './controllers/menu.controller';
import { DepartmentController } from './controllers/department.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      Menu,
      Department,
      UserRole,
      RolePermission,
    ]),
  ],
  controllers: [
    UserController,
    RoleController,
    PermissionController,
    MenuController,
    DepartmentController,
  ],
  providers: [
    UserService,
    RoleService,
    PermissionService,
    MenuService,
    DepartmentService,
  ],
  exports: [
    TypeOrmModule,
    UserService,
    RoleService,
    PermissionService,
  ],
})
export class RbacModule {}