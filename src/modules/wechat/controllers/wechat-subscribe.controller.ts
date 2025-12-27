import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { WechatSubscribeService } from '../services/wechat-subscribe.service';
import { CreateWechatSubscribeDto } from '../dto/create-wechat-subscribe.dto';
import { UpdateWechatSubscribeDto } from '../dto/update-wechat-subscribe.dto';
import { QueryWechatSubscribeDto } from '../dto/query-wechat-subscribe.dto';

@ApiTags('公众号管理-消息管理')
@Controller('admin/wechat/subscribe')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WechatSubscribeController {
  constructor(private readonly wechatSubscribeService: WechatSubscribeService) {}

  @Post()
  @ApiOperation({ summary: '创建订阅记录' })
  @ApiResponse({ status: 201, description: '订阅记录创建成功' })
  create(@Body() createWechatSubscribeDto: CreateWechatSubscribeDto) {
    return this.wechatSubscribeService.create(createWechatSubscribeDto);
  }

  @Get()
  @ApiOperation({ summary: '获取订阅列表' })
  @ApiResponse({ status: 200, description: '获取订阅列表成功' })
  findAll(@Query() queryWechatSubscribeDto: QueryWechatSubscribeDto) {
    return this.wechatSubscribeService.findAll(queryWechatSubscribeDto);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取订阅统计信息' })
  @ApiResponse({ status: 200, description: '获取订阅统计信息成功' })
  getStats() {
    return this.wechatSubscribeService.getSubscribeStats();
  }

  @Get('retry')
  @ApiOperation({ summary: '获取需要重试的订阅列表' })
  @ApiResponse({ status: 200, description: '获取重试列表成功' })
  getRetryList() {
    return this.wechatSubscribeService.getRetryList();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取订阅详情' })
  @ApiResponse({ status: 200, description: '获取订阅详情成功' })
  @ApiParam({ name: 'id', description: '订阅ID' })
  findOne(@Param('id') id: string) {
    return this.wechatSubscribeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新订阅信息' })
  @ApiResponse({ status: 200, description: '订阅信息更新成功' })
  @ApiParam({ name: 'id', description: '订阅ID' })
  update(@Param('id') id: string, @Body() updateWechatSubscribeDto: UpdateWechatSubscribeDto) {
    return this.wechatSubscribeService.update(id, updateWechatSubscribeDto);
  }

  @Post('send')
  @ApiOperation({ summary: '发送订阅消息' })
  @ApiResponse({ status: 200, description: '订阅消息发送成功' })
  sendSubscribeMessage(
    @Body()
    messageData: {
      openid: string;
      templateId: string;
      data: any;
      url?: string;
      miniprogram?: {
        appid: string;
        pagepath: string;
      };
      scene?: string;
    },
  ) {
    return this.wechatSubscribeService.sendSubscribeMessage(messageData);
  }

  @Post('send/batch')
  @ApiOperation({ summary: '批量发送订阅消息' })
  @ApiResponse({ status: 200, description: '批量发送订阅消息成功' })
  batchSendSubscribeMessage(@Body() body: { messages: any[] }) {
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      throw new BadRequestException('请提供要发送的消息列表');
    }
    return this.wechatSubscribeService.batchSendSubscribeMessage(body.messages);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新发送状态' })
  @ApiResponse({ status: 200, description: '发送状态更新成功' })
  @ApiParam({ name: 'id', description: '订阅ID' })
  updateSendStatus(
    @Param('id') id: string,
    @Body() body: { status: number; errorMessage?: string },
  ) {
    return this.wechatSubscribeService.updateSendStatus(id, body.status, body.errorMessage);
  }

  @Patch(':id/click')
  @ApiOperation({ summary: '记录点击事件' })
  @ApiResponse({ status: 200, description: '点击事件记录成功' })
  @ApiParam({ name: 'id', description: '订阅ID' })
  recordClick(@Param('id') id: string, @Body() body: { clickUrl: string }) {
    return this.wechatSubscribeService.recordClick(id, body.clickUrl);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除订阅记录' })
  @ApiResponse({ status: 200, description: '订阅记录删除成功' })
  @ApiParam({ name: 'id', description: '订阅ID' })
  remove(@Param('id') id: string) {
    return this.wechatSubscribeService.remove(id);
  }
}
