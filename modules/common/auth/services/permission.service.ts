import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, Like } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: TreeRepository<Permission>,
  ) {}

  async getPermissions(page: number = 1, limit: number = 10) {
    const [permissions, total] = await this.permissionRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { sort: 'ASC', createTime: 'DESC' }
    });

    return {
      items: permissions.map(permission => ({
        id: permission.id,
        name: permission.name,
        code: permission.code,
        description: permission.description,
        resource: permission.resource,
        action: permission.action,
        type: permission.type,
        status: permission.status,
        sort: permission.sort,
        createTime: permission.createTime
      })),
      total,
      page,
      limit
    };
  }

  async getPermission(id: string) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['parent', 'children']
    });
    
    if (!permission) {
      throw new NotFoundException('权限不存在');
    }

    return {
      id: permission.id,
      name: permission.name,
      code: permission.code,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
      type: permission.type,
      status: permission.status,
      sort: permission.sort,
      parent: permission.parent ? {
        id: permission.parent.id,
        name: permission.parent.name
      } : null,
      children: permission.children ? permission.children.map(child => ({
        id: child.id,
        name: child.name,
        code: child.code
      })) : [],
      createTime: permission.createTime
    };
  }

  async createPermission(createPermissionDto: CreatePermissionDto) {
    // 检查权限标识是否存在
    const existingPermission = await this.permissionRepository.findOne({
      where: { code: createPermissionDto.code }
    });
    
    if (existingPermission) {
      throw new ConflictException('权限标识已存在');
    }

    const permission = this.permissionRepository.create(createPermissionDto);

    // 如果有父级权限，设置父级
    if (createPermissionDto.parentId) {
      const parent = await this.permissionRepository.findOne({
        where: { id: createPermissionDto.parentId }
      });
      
      if (!parent) {
        throw new NotFoundException('父级权限不存在');
      }
      
      permission.parent = parent;
    }

    await this.permissionRepository.save(permission);

    return {
      message: '权限创建成功',
      permissionId: permission.id
    };
  }

  async updatePermission(id: string, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    
    if (!permission) {
      throw new NotFoundException('权限不存在');
    }
    
    if (updatePermissionDto.code && updatePermissionDto.code !== permission.code) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { code: updatePermissionDto.code }
      });
      
      if (existingPermission) {
        throw new ConflictException('权限标识已存在');
      }
    }

    // 如果更新父级权限
    if (updatePermissionDto.parentId && updatePermissionDto.parentId !== permission.parentId) {
      const parent = await this.permissionRepository.findOne({
        where: { id: updatePermissionDto.parentId }
      });
      
      if (!parent) {
        throw new NotFoundException('父级权限不存在');
      }
      
      permission.parent = parent;
    }

    Object.assign(permission, updatePermissionDto);
    await this.permissionRepository.save(permission);

    return {
      message: '权限更新成功',
      permissionId: id
    };
  }

  async deletePermission(id: string) {
    const permission = await this.permissionRepository.findOne({ 
      where: { id },
      relations: ['children']
    });
    
    if (!permission) {
      throw new NotFoundException('权限不存在');
    }

    // 检查是否有子权限
    if (permission.children && permission.children.length > 0) {
      throw new ConflictException('该权限下还有子权限，不能删除');
    }

    await this.permissionRepository.softDelete(id);

    return {
      message: '权限删除成功',
      permissionId: id
    };
  }

  async getPermissionTreeByType(type?: number): Promise<Permission[]> {
    const where: any = {};
    
    if (type !== undefined) {
      where.type = type;
    }
    
    return await this.permissionRepository.findTrees({
      where
    });
  }

  async getPermissionsByRole(roleId: string): Promise<Permission[]> {
    const permissions = await this.permissionRepository
      .createQueryBuilder('permission')
      .innerJoin('auth_role_permission', 'rp', 'rp.permissionId = permission.id')
      .where('rp.roleId = :roleId', { roleId })
      .getMany();
    
    return permissions;
  }

  async getPermissionStatistics(): Promise<any> {
    const total = await this.permissionRepository.count();
    const menuPermissions = await this.permissionRepository.count({ where: { type: 1 } });
    const buttonPermissions = await this.permissionRepository.count({ where: { type: 2 } });
    const apiPermissions = await this.permissionRepository.count({ where: { type: 3 } });
    const active = await this.permissionRepository.count({ where: { status: 1 } });
    
    return {
      total,
      menuPermissions,
      buttonPermissions,
      apiPermissions,
      active,
      activeRate: total > 0 ? (active / total) * 100 : 0
    };
  }
}