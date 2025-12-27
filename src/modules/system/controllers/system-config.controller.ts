import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SystemConfigService } from '../services/system-config.service';
import { SystemConfigEntity } from '../entities/system-config.entity';
import { CreateSystemConfigDto } from '../dto/create-system-config.dto';
import { UpdateSystemConfigDto } from '../dto/update-system-config.dto';
import { SystemConfigSearchDto } from '../dto/system-config-search.dto';
import { TransformInterceptor } from '../../../shared/interceptors/transform.interceptor';

@ApiTags('系统配置管理')
@Controller('system/config')
@UseInterceptors(TransformInterceptor)
export class SystemConfigController {
  constructor(private readonly configService: SystemConfigService) {}

  @Post()
  @ApiOperation({ summary: '创建系统配置' })
  @ApiResponse({ status: 201, description: '配置创建成功', type: SystemConfigEntity })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 409, description: '配置键名已存在' })
  async create(@Body() createDto: CreateSystemConfigDto): Promise<SystemConfigEntity> {
    return await this.configService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '查询系统配置列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() searchDto: SystemConfigSearchDto): Promise<{
    list: SystemConfigEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.configService.findAll(searchDto);
  }

  @Get('groups')
  @ApiOperation({ summary: '获取配置分组列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getConfigGroups(): Promise<string[]> {
    return await this.configService.getConfigGroups();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询配置' })
  @ApiResponse({ status: 200, description: '查询成功', type: SystemConfigEntity })
  @ApiResponse({ status: 404, description: '配置不存在' })
  async findOne(@Param('id') id: string): Promise<SystemConfigEntity> {
    return await this.configService.findOne(+id);
  }

  @Get('key/:key')
  @ApiOperation({ summary: '根据键名查询配置' })
  @ApiResponse({ status: 200, description: '查询成功', type: SystemConfigEntity })
  @ApiResponse({ status: 404, description: '配置不存在' })
  async findByKey(@Param('key') key: string): Promise<SystemConfigEntity> {
    return await this.configService.findByKey(key);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新系统配置' })
  @ApiResponse({ status: 200, description: '更新成功', type: SystemConfigEntity })
  @ApiResponse({ status: 404, description: '配置不存在' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSystemConfigDto,
  ): Promise<SystemConfigEntity> {
    return await this.configService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除系统配置' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '配置不存在' })
  @ApiResponse({ status: 400, description: '配置不允许删除' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.configService.remove(+id);
  }

  @Post('batch-values')
  @ApiOperation({ summary: '批量获取配置值' })
  @ApiBody({
    schema: { type: 'object', properties: { keys: { type: 'array', items: { type: 'string' } } } },
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getConfigValues(@Body('keys') keys: string[]): Promise<Record<string, any>> {
    return await this.configService.getConfigValues(keys);
  }
}
