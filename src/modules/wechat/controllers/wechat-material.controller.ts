import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { WechatMaterialService, MaterialType } from '../services/wechat-material.service';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { QueryMaterialDto } from '../dto/query-material.dto';

@ApiTags('公众号管理-素材管理')
@Controller('admin/wechat/materials')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WechatMaterialController {
  constructor(private readonly wechatMaterialService: WechatMaterialService) {}

  // 获取所有素材列表
  @Get()
  @ApiOperation({ summary: '获取素材列表' })
  @ApiResponse({ status: 200, description: '获取素材列表成功' })
  getMaterials(@Query() queryDto: QueryMaterialDto) {
    return this.wechatMaterialService.getMaterials(queryDto);
  }

  // 按类型获取素材
  @Get('type/:materialType')
  @ApiOperation({ summary: '按类型获取素材列表' })
  @ApiParam({ name: 'materialType', description: '素材类型', enum: MaterialType })
  @ApiResponse({ status: 200, description: '获取素材列表成功' })
  getMaterialsByType(
    @Param('materialType') materialType: MaterialType,
    @Query() queryDto: QueryMaterialDto,
  ) {
    return this.wechatMaterialService.getMaterialsByType(materialType, queryDto);
  }

  // 获取素材详情
  @Get(':id')
  @ApiOperation({ summary: '获取素材详情' })
  @ApiParam({ name: 'id', description: '素材ID' })
  @ApiResponse({ status: 200, description: '获取素材详情成功' })
  getMaterialById(@Param('id', ParseIntPipe) id: number) {
    return this.wechatMaterialService.getMaterialById(id);
  }

  // 创建素材
  @Post()
  @ApiOperation({ summary: '创建素材' })
  @ApiResponse({ status: 201, description: '素材创建成功' })
  createMaterial(@Body() createDto: CreateMaterialDto) {
    return this.wechatMaterialService.createMaterial(createDto);
  }

  // 更新素材
  @Put(':id')
  @ApiOperation({ summary: '更新素材' })
  @ApiParam({ name: 'id', description: '素材ID' })
  @ApiResponse({ status: 200, description: '素材更新成功' })
  updateMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMaterialDto,
  ) {
    return this.wechatMaterialService.updateMaterial(id, updateDto);
  }

  // 删除素材（软删除）
  @Delete(':id')
  @ApiOperation({ summary: '删除素材' })
  @ApiParam({ name: 'id', description: '素材ID' })
  @ApiResponse({ status: 200, description: '素材删除成功' })
  deleteMaterial(@Param('id', ParseIntPipe) id: number) {
    return this.wechatMaterialService.deleteMaterial(id);
  }

  // 永久删除素材
  @Delete(':id/permanent')
  @ApiOperation({ summary: '永久删除素材' })
  @ApiParam({ name: 'id', description: '素材ID' })
  @ApiResponse({ status: 200, description: '素材永久删除成功' })
  permanentDeleteMaterial(@Param('id', ParseIntPipe) id: number) {
    return this.wechatMaterialService.permanentDeleteMaterial(id);
  }

  // 发布素材
  @Post(':id/publish')
  @ApiOperation({ summary: '发布素材' })
  @ApiParam({ name: 'id', description: '素材ID' })
  @ApiResponse({ status: 200, description: '素材发布成功' })
  publishMaterial(@Param('id', ParseIntPipe) id: number) {
    return this.wechatMaterialService.publishMaterial(id);
  }

  // 取消发布素材
  @Post(':id/unpublish')
  @ApiOperation({ summary: '取消发布素材' })
  @ApiParam({ name: 'id', description: '素材ID' })
  @ApiResponse({ status: 200, description: '素材取消发布成功' })
  unpublishMaterial(@Param('id', ParseIntPipe) id: number) {
    return this.wechatMaterialService.unpublishMaterial(id);
  }

  // 获取素材统计
  @Get('stats/overview')
  @ApiOperation({ summary: '获取素材统计概览' })
  @ApiResponse({ status: 200, description: '获取素材统计成功' })
  getMaterialStats() {
    return this.wechatMaterialService.getMaterialStats();
  }
}