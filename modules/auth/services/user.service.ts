import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { RoleEntity } from '../entities/role.entity';
import { UserRoleEntity } from '../entities/user-role.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserSearchDto } from '../dto/user-search.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
  ) {}

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto) {
    const { username, email, phone, password, roles = [] } = createUserDto;

    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [
        { username },
        { email },
        { phone },
      ],
    });

    if (existingUser) {
      throw new ConflictException('用户名、邮箱或手机号已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userRepository.create({
      username,
      email,
      phone,
      password: hashedPassword,
      status: 'active',
      registerTime: new Date(),
    });

    const savedUser = await this.userRepository.save(user);

    // 分配角色
    if (roles && roles.length > 0) {
      for (const roleId of roles) {
        await this.userRoleRepository.save({
          userId: savedUser.id,
          roleId,
          assignedTime: new Date(),
        });
      }
    }

    this.logger.log(`User created: ${savedUser.id}`);

    return {
      code: 201,
      message: '用户创建成功',
      data: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        phone: savedUser.phone,
        status: savedUser.status,
      },
    };
  }

  /**
   * 获取用户列表
   */
  async findAll(searchDto: UserSearchDto) {
    const { 
      username, 
      email, 
      status, 
      roleId, 
      page = 1, 
      limit = 10 
    } = searchDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .addSelect(['user.id', 'user.username', 'user.email', 'user.phone', 'user.nickname', 'user.status', 'user.createdAt'])
      .addSelect('GROUP_CONCAT(role.name)", 'roles');

    if (username) {
      queryBuilder.andWhere('user.username LIKE :username', { username: `%${username}%` });
    }

    if (email) {
      queryBuilder.andWhere('user.email LIKE :email', { email: `%${email}%` });
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    if (roleId) {
      queryBuilder.andWhere('userRole.roleId = :roleId', { roleId });
    }

    const total = await queryBuilder.getCount();

    const users = await queryBuilder
      .groupBy('user.id')
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany();

    return {
      code: 200,
      message: '获取成功',
      data: {
        users: users.map((user: any) => ({
          id: user.user_id,
          username: user.username,
          email: user.email,
          phone: user.phone ? this.maskPhone(user.phone) : null,
          nickname: user.nickname,
          status: user.status,
          roles: user.roles ? user.roles.split(',') : [],
          createdAt: user.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  /**
   * 根据ID获取用户
   */
  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      code: 200,
      message: '获取成功',
      data: user,
    };
  }

  /**
   * 更新用户
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查用户名是否已被其他用户使用
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUser) {
        throw new ConflictException('用户名已被使用');
      }
    }

    // 更新用户信息
    Object.assign(user, updateUserDto);
    user.updatedAt = new Date();

    const updatedUser = await this.userRepository.save(user);

    // 更新角色关联
    if (updateUserDto.roles) {
      // 删除现有角色
      await this.userRoleRepository.delete({ userId: id });

      // 添加新角色
      for (const roleId of updateUserDto.roles) {
        await this.userRoleRepository.save({
          userId: id,
          roleId,
          assignedTime: new Date(),
        });
      }
    }

    this.logger.log(`User updated: ${id}`);

    return {
      code: 200,
      message: '更新成功',
      data: updatedUser,
    };
  }

  /**
   * 删除用户
   */
  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 软删除：更新状态
    user.status = 'inactive';
    user.updatedAt = new Date();

    await this.userRepository.save(user);

    this.logger.log(`User removed: ${id}`);

    return {
      code: 200,
      message: '删除成功',
    };
  }

  /**
   * 修改用户状态
   */
  async updateStatus(id: string, status: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.status = status;
    user.updatedAt = new Date();

    await this.userRepository.save(user);

    this.logger.log(`User status updated: ${id} -> ${status}`);

    return {
      code: 200,
      message: '状态更新成功',
    };
  }

  /**
   * 重置密码
   */
  async resetPassword(userId: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    user.mustChangePassword = true;
    user.updatedAt = new Date();

    await this.userRepository.save(user);

    this.logger.log(`Password reset for user: ${userId}`);

    return {
      code: 200,
      message: '密码重置成功',
    };
  }

  /**
   * 手机号脱敏
   */
  private maskPhone(phone: string): string {
    if (!phone || phone.length < 11) {
      return phone;
    }
    return phone.substring(0, 3) + '****' + phone.substring(7);
  }

  /**
   * 获取用户统计信息
   */
  async getUserStatistics(userId?: string, days: number = 30) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (userId) {
      // 单个用户统计
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles'],
      });

      return {
        code: 200,
        message: '获取成功',
        data: {
          userId,
          username: user.username,
          email: user.email,
          phone: user.phone ? this.maskPhone(user.phone) : null,
          nickname: user.nickname,
          status: user.status,
          roles: user.roles.map(role => role.name),
          loginCount: user.loginCount,
          lastLoginAt: user.lastLoginAt,
          registerTime: user.registerTime,
          daysSinceRegister: Math.floor((Date.now() - user.registerTime.getTime()) / (1000 * 60 * 60 * 24)),
        },
      };
    } else {
      // 全体用户统计
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [totalCount, activeCount, newCount] = await Promise.all([
        queryBuilder.getCount(),
        queryBuilder.where('user.status = :status', { status: 'active' }).getCount(),
        queryBuilder.where('user.registerTime >= :startDate', { startDate }).getCount(),
      ]);

      return {
        code: 200,
        message: '获取成功',
        data: {
          totalCount,
          activeCount,
          inactiveCount: totalCount - activeCount,
          newCount,
          period: `${days}天`,
        },
      };
    }
  }
}