import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { Menu } from '../entities/menu.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async getRoles(page: number = 1, limit: number = 10) {
    const [roles, total] = await this.roleRepository.findAndCount({
      relations: ['permissions', 'users'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createTime: 'DESC' }
    });

    return {
      items: roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        status: role.status,
        permissions: role.permissions.map(p => ({
          id: p.id,
          name: p.name,
          code: p.code
        })),
        userCount: role.users ? role.users.length : 0,
        createTime: role.createTime
      })),
      total,
      page,
      limit
    };
  }

  async getRole(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'users']
    });
    
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      status: role.status,
      permissions: role.permissions.map(p => ({
        id: p.id,
        name: p.name,
        code: p.code,
        resource: p.resource,
        action: p.action
      })),
      users: role.users ? role.users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email
      })) : [],
      createTime: role.createTime
    };
  }

  async createRole(createRoleDto: CreateRoleDto) {
    // 检查角色名是否存在
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name }
    });
    
    if (existingRole) {
      throw new ConflictException('角色名称已存在');
    }

    const role = this.roleRepository.create(createRoleDto);
    await this.roleRepository.save(role);

    return {
      message: '角色创建成功',
      roleId: role.id
    };
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({ where: { id } });
    
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name }
      });
      
      if (existingRole) {
        throw new ConflictException('角色名称已存在');
      }
    }

    await this.roleRepository.update(id, updateRoleDto);

    return {
      message: '角色更新成功',
      roleId: id
    };
  }

  async deleteRole(id: string) {
    const role = await this.roleRepository.findOne({ 
      where: { id },
      relations: ['users']
    });
    
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 检查是否有用户关联此角色
    if (role.users && role.users.length > 0) {
      throw new BadRequestException('该角色下还有用户，不能删除');
    }

    await this.roleRepository.softDelete(id);

    return {
      message: '角色删除成功',
      roleId: id
    };
  }

  async assignPermissions(id: string, permissionIds: string[]) {
    const role = await this.roleRepository.findOne({ 
      where: { id },
      relations: ['permissions']
    });
    
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) }
    });
    
    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('部分权限不存在');
    }

    role.permissions = permissions;
    await this.roleRepository.save(role);

    return {
      message: '权限分配成功',
      roleId: id
    };
  }

  async removePermissions(id: string, permissionIds: string[]) {
    const role = await this.roleRepository.findOne({ 
      where: { id },
      relations: ['permissions']
    });
    
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 移除指定的权限
    role.permissions = role.permissions.filter(permission => !permissionIds.includes(permission.id));
    await this.roleRepository.save(role);

    return {
      message: '权限移除成功',
      roleId: id
    };
  }

  async updateStatus(id: string, status: number, currentUser?: string): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { id } });
    
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    
    await this.roleRepository.update(id, {
      status,
      updateBy: currentUser,
      updateTime: new Date()
    });
  }

  async getRolePermissions(id: string): Promise<string[]> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions']
    });
    
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    
    return role.permissions.map(permission => permission.code);
  }

  async getRoleMenus(id: string): Promise<Menu[]> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['menus']
    });
    
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    
    return role.menus;
  }

  async getRoleStatistics(): Promise<any> {
    const total = await this.roleRepository.count();
    const active = await this.roleRepository.count({ where: { status: 1 } });
    const system = await this.roleRepository.count({ where: { type: 0 } });
    const custom = await this.roleRepository.count({ where: { type: 1 } });
    
    return {
      total,
      active,
      system,
      custom,
      activeRate: total > 0 ? (active / total) * 100 : 0
    };
  }
}