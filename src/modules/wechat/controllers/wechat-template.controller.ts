import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { WechatTemplateService } from '../services/wechat-template.service';

@ApiTags('公众号管理-消息管理')
@Controller('admin/wechat/template')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WechatTemplateController {
  constructor(private readonly wechatTemplateService: WechatTemplateService) {}

  @Get()
  @ApiOperation({ summary: '获取模板消息列表' })
  @ApiResponse({ status: 200, description: '获取模板消息列表成功' })
  getTemplateList() {
    return this.wechatTemplateService.getTemplateList();
  }

  @Post()
  @ApiOperation({ summary: '创建模板消息' })
  @ApiResponse({ status: 201, description: '模板消息创建成功' })
  createTemplate() {
    return this.wechatTemplateService.createTemplate();
  }
}
