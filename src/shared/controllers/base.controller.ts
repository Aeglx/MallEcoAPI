import { Get, Post, Put, Delete, Param, Query, Body, HttpStatus, HttpException } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * 基础控制器抽象类，提供通用的CRUD操作方法
 * @template T 实体类型
 * @template CreateDto 创建数据传输对象类型
 * @template UpdateDto 更新数据传输对象类型
 */
export abstract class BaseController<T, CreateDto, UpdateDto> {
  /**
   * 构造函数，注入服务实例
   * @param service 业务服务实例
   */
  constructor(protected readonly service: any) {}

  /**
   * 查询列表
   * @param query 查询参数
   * @returns 实体列表
   */
  @Get()
  @ApiOperation({ summary: '查询列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() query?: any): Promise<{ data: T[]; total?: number }> {
    try {
      const result = await this.service.findAll(query);
      return Array.isArray(result) ? { data: result } : result;
    } catch (error) {
      throw new HttpException(
        { message: '查询列表失败', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 查询详情
   * @param id 实体ID
   * @returns 实体详情
   */
  @Get(':id')
  @ApiOperation({ summary: '查询详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '实体不存在' })
  async findOne(@Param('id') id: string): Promise<T> {
    try {
      const entity = await this.service.findOne(id);
      if (!entity) {
        throw new HttpException('实体不存在', HttpStatus.NOT_FOUND);
      }
      return entity;
    } catch (error) {
      throw error.status === HttpStatus.NOT_FOUND ? error :
        new HttpException(
          { message: '查询详情失败', error: error.message },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }

  /**
   * 创建实体
   * @param createDto 创建数据
   * @returns 创建的实体
   */
  @Post()
  @ApiOperation({ summary: '创建' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createDto: CreateDto): Promise<T> {
    try {
      return await this.service.create(createDto);
    } catch (error) {
      throw new HttpException(
        { message: '创建失败', error: error.message },
        error.status === HttpStatus.BAD_REQUEST ? HttpStatus.BAD_REQUEST :
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 更新实体
   * @param id 实体ID
   * @param updateDto 更新数据
   * @returns 更新后的实体
   */
  @Put(':id')
  @ApiOperation({ summary: '更新' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '实体不存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateDto): Promise<T> {
    try {
      // 先检查实体是否存在
      const existingEntity = await this.service.findOne(id);
      if (!existingEntity) {
        throw new HttpException('实体不存在', HttpStatus.NOT_FOUND);
      }
      return await this.service.update(id, updateDto);
    } catch (error) {
      throw error.status ? error :
        new HttpException(
          { message: '更新失败', error: error.message },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }

  /**
   * 删除实体
   * @param id 实体ID
   * @returns 删除结果
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '实体不存在' })
  async remove(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    try {
      // 先检查实体是否存在
      const existingEntity = await this.service.findOne(id);
      if (!existingEntity) {
        throw new HttpException('实体不存在', HttpStatus.NOT_FOUND);
      }
      await this.service.remove(id);
      return { success: true, message: '删除成功' };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        { message: '删除失败', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
