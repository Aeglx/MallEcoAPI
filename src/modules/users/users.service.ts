import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  // 使用内存数组模拟数据库
  private readonly users: User[] = [];
  
  constructor() {}


  /**
   * 创建用户
   * @param userData 用户数据
   * @returns 创建的用户
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = {
      id: Date.now().toString(), // 使用时间戳作为ID
      createTime: new Date(),
      updateTime: new Date(),
      ...userData,
    } as User;
    this.users.push(user);
    return user;
  }

  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户信息
   */
  async findById(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户信息
   */
  async findByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  /**
   * 根据邮箱查找用户
   * @param email 邮箱
   * @returns 用户信息
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  /**
   * 根据手机号查找用户
   * @param phone 手机号
   * @returns 用户信息
   */
  async findByPhone(phone: string): Promise<User | undefined> {
    return this.users.find(user => user.phone === phone);
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param userData 更新的数据
   * @returns 更新后的用户
   */
  async update(id: string, userData: Partial<User>): Promise<User | undefined> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      return undefined;
    }
    
    this.users[index] = {
      ...this.users[index],
      ...userData,
      updateTime: new Date(),
    };
    
    return this.users[index];
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 删除结果
   */
  async delete(id: string): Promise<boolean> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      return false;
    }
    
    this.users.splice(index, 1);
    return true;
  }
}
