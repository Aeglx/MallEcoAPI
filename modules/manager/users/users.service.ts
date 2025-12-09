import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserStatus } from '../../../src/modules/users/entities/user.entity';
import { QueryUserDto, CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ManagerUsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  /**
   * 获取用户列表
   */
  async getUsers(query: QueryUserDto): Promise<any> {
    const { page = 1, limit = 10, username, phone, email } = query;
    
    const whereConditions: any = {};
    
    if (username) {
      whereConditions.username = Like(`%${username}%`);
    }
    
    if (phone) {
      whereConditions.phone = Like(`%${phone}%`);
    }
    
    if (email) {
      whereConditions.email = Like(`%${email}%`);
    }
    
    const [users, total] = await this.userRepository.findAndCount({
      where: whereConditions,
      order: { createTime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    return {
      data: users,
      total,
      page,
      limit,
    };
  }

  /**
   * 获取用户详情
   */
  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  /**
   * 创建用户
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [{ username: createUserDto.username }],
    });
    
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }
    
    // 检查手机号是否已存在
    if (createUserDto.phone) {
      const existingPhone = await this.userRepository.findOne({
        where: [{ phone: createUserDto.phone }],
      });
      
      if (existingPhone) {
        throw new BadRequestException('Phone number already exists');
      }
    }
    
    // 检查邮箱是否已存在
    if (createUserDto.email) {
      const existingEmail = await this.userRepository.findOne({
        where: [{ email: createUserDto.email }],
      });
      
      if (existingEmail) {
        throw new BadRequestException('Email already exists');
      }
    }
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // 创建用户
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    
    return this.userRepository.save(user);
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(id);
    
    // 检查手机号是否已存在（排除当前用户）
    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingPhone = await this.userRepository.findOne({
        where: [{ phone: updateUserDto.phone }],
      });
      
      if (existingPhone) {
        throw new BadRequestException('Phone number already exists');
      }
    }
    
    // 检查邮箱是否已存在（排除当前用户）
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: [{ email: updateUserDto.email }],
      });
      
      if (existingEmail) {
        throw new BadRequestException('Email already exists');
      }
    }
    
    // 如果更新密码，需要加密
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    // 更新用户信息
    const updatedUser = this.userRepository.merge(user, updateUserDto);
    
    return this.userRepository.save(updatedUser);
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    
    // 软删除用户
    await this.userRepository.softDelete(id);
  }

  /**
   * 批量删除用户
   */
  async batchDeleteUsers(ids: string[]): Promise<void> {
    await this.userRepository.softDelete(ids);
  }

  /**
   * 启用用户
   */
  async enableUser(id: string): Promise<User> {
    const user = await this.getUserById(id);
    
    user.status = UserStatus.ACTIVE;
    
    return this.userRepository.save(user);
  }

  /**
   * 禁用用户
   */
  async disableUser(id: string): Promise<User> {
    const user = await this.getUserById(id);
    
    user.status = UserStatus.INACTIVE;
    
    return this.userRepository.save(user);
  }

  /**
   * 重置用户密码
   */
  async resetPassword(id: string, newPassword: string): Promise<User> {
    const user = await this.getUserById(id);
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    user.password = hashedPassword;
    
    return this.userRepository.save(user);
  }

  /**
   * 封禁用户
   */
  async banUser(id: string): Promise<User> {
    const user = await this.getUserById(id);
    
    user.status = UserStatus.BANNED;
    
    return this.userRepository.save(user);
  }
}
