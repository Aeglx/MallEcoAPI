import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Department } from '../entities/department.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async getUsers(page: number = 1, limit: number = 10) {
    const [users, total] = await this.userRepository.findAndCount({
      relations: ['roles', 'department'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createTime: 'DESC' }
    });

    return {
      items: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.mobile,
        status: user.status,
        roles: user.role ? [{ id: user.role.id, name: user.role.name }] : [],
        department: user.department ? {
          id: user.department.id,
          name: user.department.name
        } : null,
        createTime: user.createTime,
        lastLoginTime: user.lastLoginTime
      })),
      total,
      page,
      limit
    };
  }

  async getUser(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'department']
    });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.mobile,
      avatar: user.avatar,
      status: user.status,
      roles: user.role ? [{
        id: user.role.id,
        name: user.role.name,
        permissions: user.role.permissions ? user.role.permissions.map(p => ({
          id: p.id,
          name: p.name,
          code: p.code
        })) : []
      }] : [],

      department: user.department ? {
        id: user.department.id,
        name: user.department.name
      } : null,
      createTime: user.createTime,
      lastLoginTime: user.lastLoginTime
    };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username }
      });
      
      if (existingUser) {
        throw new ConflictException('用户名已存在');
      }
    }
    
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email }
      });
      
      if (existingEmail) {
        throw new ConflictException('邮箱已存在');
      }
    }

    // 如果更新密码，需要加密
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.update(id, updateUserDto);
    
    return {
      message: '用户信息更新成功',
      userId: id
    };
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.userRepository.softDelete(id);
    
    return {
      message: '用户删除成功',
      userId: id
    };
  }

  async setRoles(id: string, roleIds: string[]) {
    const user = await this.userRepository.findOne({ 
      where: { id }
    });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (roleIds.length > 1) {
      throw new BadRequestException('用户只能分配一个角色');
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleIds[0] }
    });

    if (!role) {
      throw new BadRequestException('角色不存在');
    }

    user.role = role;
    user.roleId = role.id;
    await this.userRepository.save(user);

    return {
      message: '角色分配成功',
      userId: id
    };
  }

  async removeRoles(id: string, roleIds: string[]) {
    const user = await this.userRepository.findOne({ 
      where: { id }
    });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 移除用户的角色
    if (user.role && roleIds.includes(user.role.id)) {
      user.role = null;
      user.roleId = null;
      await this.userRepository.save(user);
    }

    return {
      message: '角色移除成功',
      userId: id
    };
  }

  async updateUserStatus(id: string, status: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.userRepository.update(id, { status });

    return {
      message: '用户状态更新成功',
      userId: id,
      status
    };
  }

  async getUserPermissions(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions']
    });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const permissions = user.role && user.role.permissions ? user.role.permissions : [];
    
    return {
      userId: id,
      permissions: permissions.map(p => ({
        id: p.id,
        name: p.name,
        code: p.code,
        resource: p.resource,
        action: p.action
      }))
    };
  }
}