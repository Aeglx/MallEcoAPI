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
  BadRequestException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { WechatFansService } from '../services/wechat-fans.service';
import { CreateWechatFansDto } from '../dto/create-wechat-fans.dto';
import { UpdateWechatFansDto } from '../dto/update-wechat-fans.dto';
import { QueryWechatFansDto } from '../dto/query-wechat-fans.dto';

@ApiTags('公众号管理-消息管理')
@Controller('admin/wechat/fans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WechatFansController {
  constructor(private readonly wechatFansService: WechatFansService) {}

  @Post()
  @ApiOperation({ summary: '创建粉丝' })
  @ApiResponse({ status: 201, description: '粉丝创建成功' })
  create(@Body() createWechatFansDto: CreateWechatFansDto) {
    return this.wechatFansService.create(createWechatFansDto);
  }

  @Get()
  @ApiOperation({ summary: '获取粉丝列表' })
  @ApiResponse({ status: 200, description: '获取粉丝列表成功' })
  findAll(@Query() queryWechatFansDto: QueryWechatFansDto) {
    return this.wechatFansService.findAll(queryWechatFansDto);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取粉丝统计信息' })
  @ApiResponse({ status: 200, description: '获取粉丝统计信息成功' })
  getStats() {
    return this.wechatFansService.getFansStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取粉丝详情' })
  @ApiResponse({ status: 200, description: '获取粉丝详情成功' })
  @ApiParam({ name: 'id', description: '粉丝ID' })
  findOne(@Param('id') id: string) {
    return this.wechatFansService.findOne(id);
  }

  @Get('openid/:openid')
  @ApiOperation({ summary: '根据openid获取粉丝详情' })
  @ApiResponse({ status: 200, description: '获取粉丝详情成功' })
  @ApiParam({ name: 'openid', description: '粉丝openid' })
  findByOpenid(@Param('openid') openid: string) {
    return this.wechatFansService.findByOpenid(openid);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新粉丝信息' })
  @ApiResponse({ status: 200, description: '粉丝信息更新成功' })
  @ApiParam({ name: 'id', description: '粉丝ID' })
  update(@Param('id') id: string, @Body() updateWechatFansDto: UpdateWechatFansDto) {
    return this.wechatFansService.update(id, updateWechatFansDto);
  }

  @Patch('tags/batch')
  @ApiOperation({ summary: '批量更新粉丝标签' })
  @ApiResponse({ status: 200, description: '批量更新标签成功' })
  batchUpdateTags(@Body() body: { ids: string[], tagIds: number[] }) {
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException('请选择要操作的粉丝');
    }
    return this.wechatFansService.batchUpdateTags(body.ids, body.tagIds);
  }

  @Patch('blacklist/batch')
  @ApiOperation({ summary: '批量更新黑名单状态' })
  @ApiResponse({ status: 200, description: '批量更新黑名单状态成功' })
  batchUpdateBlacklist(@Body() body: { ids: string[], blacklist: number }) {
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException('请选择要操作的粉丝');
    }
    return this.wechatFansService.batchUpdateBlacklist(body.ids, body.blacklist);
  }

  @Patch('subscribe/:openid')
  @ApiOperation({ summary: '更新粉丝关注状态' })
  @ApiResponse({ status: 200, description: '关注状态更新成功' })
  @ApiParam({ name: 'openid', description: '粉丝openid' })
  updateSubscribeStatus(
    @Param('openid') openid: string, 
    @Body() body: { subscribeStatus: number }
  ) {
    return this.wechatFansService.updateSubscribeStatus(openid, body.subscribeStatus);
  }

  @Patch('sync/:openid')
  @ApiOperation({ summary: '同步粉丝信息' })
  @ApiResponse({ status: 200, description: '同步粉丝信息成功' })
  @ApiParam({ name: 'openid', description: '粉丝openid' })
  syncFansInfo(@Param('openid') openid: string) {
    return this.wechatFansService.syncFansInfo(openid);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除粉丝' })
  @ApiResponse({ status: 200, description: '粉丝删除成功' })
  @ApiParam({ name: 'id', description: '粉丝ID' })
  remove(@Param('id') id: string) {
    return this.wechatFansService.remove(id);
  }
}