import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 创建用户
   * @param userData 用户数据
   * @returns 创建的用户
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户信息
   */
  async findById(id: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { id } });
  }

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户信息
   */
  async findByUsername(username: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { username } });
  }

  /**
   * 根据邮箱查找用户
   * @param email 邮箱
   * @returns 用户信息
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  /**
   * 根据手机号查找用户
   * @param phone 手机号
   * @returns 用户信息
   */
  async findByPhone(phone: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { phone } });
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param userData 更新的数据
   * @returns 更新后的用户
   */
  async update(id: string, userData: Partial<User>): Promise<User | undefined> {
    await this.userRepository.update(id, userData);
    return await this.findById(id);
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 删除结果
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected > 0;
  }
}
