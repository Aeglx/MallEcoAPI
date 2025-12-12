import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RoleSearchDto } from '../dto/role-search.dto';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { UserRole } from '../entities/user-role.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async findAll(searchDto: RoleSearchDto): Promise<{ data: Role[]; total: number }> {
    const { name, code, status, page = 1, pageSize = 20 } = searchDto;
    
    const queryBuilder = this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.rolePermissions', 'rolePermissions')
      .leftJoinAndSelect('rolePermissions.permission', 'permission');

    if (name) {
      queryBuilder.andWhere('role.name LIKE :name', { name: `%${name}%` });
    }

    if (code) {
      queryBuilder.andWhere('role.code LIKE :code', { code: `%${code}%` });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('role.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('role.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });

    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    
    Object.assign(role, updateRoleDto);
    return await this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    
    // 检查是否有用户关联该角色
    const userCount = await this.userRoleRepository.count({ where: { roleId: id } });
    if (userCount > 0) {
      throw new Error('该角色已被用户使用，无法删除');
    }
    
    await this.roleRepository.remove(role);
  }

  async assignPermissions(roleId: number, permissionIds: number[]): Promise<void> {
    const role = await this.findOne(roleId);
    
    // 删除现有权限关联
    await this.rolePermissionRepository.delete({ roleId });

    // 创建新的权限关联
    const rolePermissions = permissionIds.map(permissionId => {
      return this.rolePermissionRepository.create({ roleId, permissionId });
    });

    await this.rolePermissionRepository.save(rolePermissions);
  }

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });

    return rolePermissions.map(rolePermission => rolePermission.permission);
  }

  async getRoleUsers(roleId: number): Promise<User[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { roleId },
      relations: ['user', 'user.department'],
    });

    return userRoles.map(userRole => userRole.user);
  }

  async findByCode(code: string): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { code },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
  }

  async getRolePermissionsTree(roleId: number): Promise<any[]> {
    const permissions = await this.getRolePermissions(roleId);
    
    // 构建权限树形结构
    const permissionMap = new Map<number, any>();
    const tree: any[] = [];

    permissions.forEach(permission => {
      permissionMap.set(permission.id, {
        ...permission,
        children: [],
      });
    });

    permissions.forEach(permission => {
      if (permission.parentId) {
        const parent = permissionMap.get(permission.parentId);
        if (parent) {
          parent.children.push(permissionMap.get(permission.id));
        }
      } else {
        tree.push(permissionMap.get(permission.id));
      }
    });

    return tree;
  }
}