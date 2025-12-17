import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { WechatH5Service } from '../services/wechat-h5.service';
import { CreateH5PageDto } from '../dto/create-h5-page.dto';
import { UpdateH5PageDto } from '../dto/update-h5-page.dto';
import { QueryH5PageDto } from '../dto/query-h5-page.dto';
import { CreateH5TemplateDto } from '../dto/create-h5-template.dto';
import { UpdateH5TemplateDto } from '../dto/update-h5-template.dto';
import { QueryH5TemplateDto } from '../dto/query-h5-template.dto';

@ApiTags('公众号管理-H5网页')
@Controller('admin/wechat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WechatH5Controller {
  constructor(private readonly wechatH5Service: WechatH5Service) {}

  // H5页面管理
  @Get('h5-pages')
  @ApiOperation({ summary: '获取H5页面列表' })
  @ApiResponse({ status: 200, description: '获取H5页面列表成功' })
  getH5Pages(@Query() queryDto: QueryH5PageDto) {
    return this.wechatH5Service.getH5Pages(queryDto);
  }

  @Get('h5-pages/:id')
  @ApiOperation({ summary: '获取H5页面详情' })
  @ApiParam({ name: 'id', description: 'H5页面ID' })
  @ApiResponse({ status: 200, description: '获取H5页面详情成功' })
  getH5PageById(@Param('id') id: string) {
    return this.wechatH5Service.getH5PageById(id);
  }

  @Post('h5-pages')
  @ApiOperation({ summary: '创建H5页面' })
  @ApiResponse({ status: 201, description: 'H5页面创建成功' })
  createH5Page(@Body() createDto: CreateH5PageDto) {
    return this.wechatH5Service.createH5Page(createDto);
  }

  @Put('h5-pages/:id')
  @ApiOperation({ summary: '更新H5页面' })
  @ApiParam({ name: 'id', description: 'H5页面ID' })
  @ApiResponse({ status: 200, description: 'H5页面更新成功' })
  updateH5Page(
    @Param('id') id: string,
    @Body() updateDto: UpdateH5PageDto,
  ) {
    return this.wechatH5Service.updateH5Page(id, updateDto);
  }

  @Delete('h5-pages/:id')
  @ApiOperation({ summary: '删除H5页面' })
  @ApiParam({ name: 'id', description: 'H5页面ID' })
  @ApiResponse({ status: 200, description: 'H5页面删除成功' })
  deleteH5Page(@Param('id') id: string) {
    return this.wechatH5Service.deleteH5Page(id);
  }

  @Post('h5-pages/:id/publish')
  @ApiOperation({ summary: '发布H5页面' })
  @ApiParam({ name: 'id', description: 'H5页面ID' })
  @ApiResponse({ status: 200, description: 'H5页面发布成功' })
  publishH5Page(@Param('id') id: string) {
    return this.wechatH5Service.publishH5Page(id);
  }

  @Post('h5-pages/:id/unpublish')
  @ApiOperation({ summary: '取消发布H5页面' })
  @ApiParam({ name: 'id', description: 'H5页面ID' })
  @ApiResponse({ status: 200, description: 'H5页面取消发布成功' })
  unpublishH5Page(@Param('id') id: string) {
    return this.wechatH5Service.unpublishH5Page(id);
  }

  // H5模板管理
  @Get('h5-templates')
  @ApiOperation({ summary: '获取H5模板列表' })
  @ApiResponse({ status: 200, description: '获取H5模板列表成功' })
  getH5Templates(@Query() queryDto: QueryH5TemplateDto) {
    return this.wechatH5Service.getH5Templates(queryDto);
  }

  @Get('h5-templates/:id')
  @ApiOperation({ summary: '获取H5模板详情' })
  @ApiParam({ name: 'id', description: 'H5模板ID' })
  @ApiResponse({ status: 200, description: '获取H5模板详情成功' })
  getH5TemplateById(@Param('id') id: string) {
    return this.wechatH5Service.getH5TemplateById(id);
  }

  @Post('h5-templates')
  @ApiOperation({ summary: '创建H5模板' })
  @ApiResponse({ status: 201, description: 'H5模板创建成功' })
  createH5Template(@Body() createDto: CreateH5TemplateDto) {
    return this.wechatH5Service.createH5Template(createDto);
  }

  @Put('h5-templates/:id')
  @ApiOperation({ summary: '更新H5模板' })
  @ApiParam({ name: 'id', description: 'H5模板ID' })
  @ApiResponse({ status: 200, description: 'H5模板更新成功' })
  updateH5Template(
    @Param('id') id: string,
    @Body() updateDto: UpdateH5TemplateDto,
  ) {
    return this.wechatH5Service.updateH5Template(id, updateDto);
  }

  @Delete('h5-templates/:id')
  @ApiOperation({ summary: '删除H5模板' })
  @ApiParam({ name: 'id', description: 'H5模板ID' })
  @ApiResponse({ status: 200, description: 'H5模板删除成功' })
  deleteH5Template(@Param('id') id: string) {
    return this.wechatH5Service.deleteH5Template(id);
  }
}