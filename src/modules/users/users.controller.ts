import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() userData: Partial<User>): Promise<User> {
    return await this.usersService.create(userData);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户' })
  @ApiResponse({ status: 200, description: '获取用户成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findById(@Param('id') id: string): Promise<User | undefined> {
    return await this.usersService.findById(id);
  }

  @Get()
  @ApiOperation({ summary: '根据条件查询用户' })
  @ApiResponse({ status: 200, description: '查询用户成功' })
  async findByCondition(@Query() query: any): Promise<User | undefined> {
    if (query.username) {
      return await this.usersService.findByUsername(query.username);
    } else if (query.email) {
      return await this.usersService.findByEmail(query.email);
    } else if (query.phone) {
      return await this.usersService.findByPhone(query.phone);
    }
    return undefined;
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiResponse({ status: 200, description: '更新用户成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async update(@Param('id') id: string, @Body() userData: Partial<User>): Promise<User | undefined> {
    return await this.usersService.update(id, userData);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '删除用户成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    const result = await this.usersService.delete(id);
    return { success: result };
  }
}
