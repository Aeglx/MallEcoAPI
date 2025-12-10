import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionSearchDto } from '../dto/permission-search.dto';
import { RolePermission } from '../entities/role-permission.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionRepository.create(createPermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async findAll(searchDto: PermissionSearchDto): Promise<Permission[]> {
    const { name, code, type, module, page = 1, limit = 10, sortBy = 'id', sortOrder = 'DESC' } = searchDto;
    
    const queryBuilder = this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.parent', 'parent');

    if (name) {
      queryBuilder.andWhere('permission.name LIKE :name', { name: `%${name}%` });
    }

    if (code) {
      queryBuilder.andWhere('permission.code LIKE :code', { code: `%${code}%` });
    }

    if (type) {
      queryBuilder.andWhere('permission.type = :type', { type });
    }

    if (module) {
      queryBuilder.andWhere('permission.module LIKE :module', { module: `%${module}%` });
    }

    return await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy(`permission.${sortBy}`, sortOrder)
      .getMany();
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!permission) {
      throw new NotFoundException(`权限 ID ${id} 不存在`);
    }

    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);
    
    Object.assign(permission, updatePermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async remove(id: number): Promise<void> {
    const permission = await this.findOne(id);
    
    // 检查是否有子权限
    const childCount = await this.permissionRepository.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new Error('该权限存在子权限，无法删除');
    }
    
    // 检查是否有角色关联该权限
    const roleCount = await this.rolePermissionRepository.count({ where: { permissionId: id } });
    if (roleCount > 0) {
      throw new Error('该权限已被角色使用，无法删除');
    }
    
    await this.permissionRepository.remove(permission);
  }

  async getPermissionTree(): Promise<any[]> {
    const permissions = await this.permissionRepository.find({
      where: { enabled: true },
      order: { sort: 'ASC', createdAt: 'DESC' },
    });

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

  async getPermissionRoles(permissionId: number): Promise<Role[]> {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { permissionId },
      relations: ['role'],
    });

    return rolePermissions.map(rolePermission => rolePermission.role);
  }

  async findByCode(code: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { code },
    });
  }

  async getChildren(permissionId: number): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { parentId: permissionId },
      order: { sort: 'ASC' },
    });
  }

  async movePermission(permissionId: number, parentId: number | null): Promise<void> {
    const permission = await this.findOne(permissionId);
    
    if (parentId !== null) {
      const parent = await this.findOne(parentId);
      permission.parentId = parent.id;
    } else {
      permission.parentId = null;
    }
    
    await this.permissionRepository.save(permission);
  }
}