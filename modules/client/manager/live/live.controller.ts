import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LiveRoomService } from '../../common/live/services/live-room.service';
import { LiveGoodsService } from '../../common/live/services/live-goods.service';
import { LiveOrderService } from '../../common/live/services/live-order.service';
import { LiveChatService } from '../../common/live/services/live-chat.service';
import { CreateLiveRoomDto } from '../../common/live/dto/create-live-room.dto';
import { UpdateLiveRoomDto } from '../../common/live/dto/update-live-room.dto';
import { CreateLiveGoodsDto } from '../../common/live/dto/create-live-goods.dto';
import { UpdateLiveGoodsDto } from '../../common/live/dto/update-live-goods.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('管理端-直播')
@Controller('manager/live')
export class LiveController {
  constructor(
    private readonly liveRoomService: LiveRoomService,
    private readonly liveGoodsService: LiveGoodsService,
    private readonly liveOrderService: LiveOrderService,
    private readonly liveChatService: LiveChatService,
  ) {}

  @Post('rooms')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建直播间', description: '创建新的直播间' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async createLiveRoom(@Body() createLiveRoomDto: CreateLiveRoomDto) {
    const data = await this.liveRoomService.create(createLiveRoomDto);
    return {
      code: HttpStatus.CREATED,
      message: '创建成功',
      data
    };
  }

  @Get('rooms')
  @ApiOperation({ summary: '获取直播间列表', description: '获取所有直播间列表，支持分页和筛选' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getLiveRooms(@Query() paginationDto: PaginationDto) {
    const [data, total] = await this.liveRoomService.findAll(paginationDto);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: { list: data, total, page: paginationDto.page, limit: paginationDto.limit }
    };
  }

  @Get('rooms/:id')
  @ApiOperation({ summary: '获取直播间详情', description: '根据ID获取直播间详细信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async getLiveRoom(@Param('id') id: string) {
    const data = await this.liveRoomService.findOne(id);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data
    };
  }

  @Put('rooms/:id')
  @ApiOperation({ summary: '更新直播间信息', description: '更新直播间基本信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async updateLiveRoom(@Param('id') id: string, @Body() updateLiveRoomDto: UpdateLiveRoomDto) {
    const data = await this.liveRoomService.update(id, updateLiveRoomDto);
    return {
      code: HttpStatus.OK,
      message: '更新成功',
      data
    };
  }

  @Delete('rooms/:id')
  @ApiOperation({ summary: '删除直播间', description: '删除指定的直播间' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 400, description: '直播中的直播间不能删除' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async deleteLiveRoom(@Param('id') id: string) {
    await this.liveRoomService.remove(id);
    return {
      code: HttpStatus.OK,
      message: '删除成功'
    };
  }

  @Post('rooms/:id/start')
  @ApiOperation({ summary: '开始直播', description: '开始指定的直播间直播' })
  @ApiResponse({ status: 200, description: '开始成功' })
  @ApiResponse({ status: 400, description: '直播间状态错误' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async startLive(@Param('id') id: string) {
    const data = await this.liveRoomService.startLive(id);
    return {
      code: HttpStatus.OK,
      message: '开始直播成功',
      data
    };
  }

  @Post('rooms/:id/end')
  @ApiOperation({ summary: '结束直播', description: '结束指定的直播间直播' })
  @ApiResponse({ status: 200, description: '结束成功' })
  @ApiResponse({ status: 400, description: '直播间状态错误' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async endLive(@Param('id') id: string) {
    const data = await this.liveRoomService.endLive(id);
    return {
      code: HttpStatus.OK,
      message: '结束直播成功',
      data
    };
  }

  @Post('rooms/:id/pause')
  @ApiOperation({ summary: '暂停直播', description: '暂停指定的直播间直播' })
  @ApiResponse({ status: 200, description: '暂停成功' })
  @ApiResponse({ status: 400, description: '直播间状态错误' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async pauseLive(@Param('id') id: string) {
    const data = await this.liveRoomService.pauseLive(id);
    return {
      code: HttpStatus.OK,
      message: '暂停直播成功',
      data
    };
  }

  @Post('rooms/:id/resume')
  @ApiOperation({ summary: '恢复直播', description: '恢复暂停的直播间直播' })
  @ApiResponse({ status: 200, description: '恢复成功' })
  @ApiResponse({ status: 400, description: '直播间状态错误' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async resumeLive(@Param('id') id: string) {
    const data = await this.liveRoomService.resumeLive(id);
    return {
      code: HttpStatus.OK,
      message: '恢复直播成功',
      data
    };
  }

  @Post('goods')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建直播商品', description: '创建直播商品关联' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async createLiveGoods(@Body() createLiveGoodsDto: CreateLiveGoodsDto) {
    const data = await this.liveGoodsService.create(createLiveGoodsDto);
    return {
      code: HttpStatus.CREATED,
      message: '创建成功',
      data
    };
  }

  @Get('goods')
  @ApiOperation({ summary: '获取直播商品列表', description: '获取所有直播商品列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getLiveGoods(@Query() paginationDto: PaginationDto) {
    const [data, total] = await this.liveGoodsService.findAll(paginationDto);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: { list: data, total, page: paginationDto.page, limit: paginationDto.limit }
    };
  }

  @Get('goods/:id')
  @ApiOperation({ summary: '获取直播商品详情', description: '根据ID获取直播商品详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async getLiveGoodsDetail(@Param('id') id: string) {
    const data = await this.liveGoodsService.findOne(id);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data
    };
  }

  @Put('goods/:id')
  @ApiOperation({ summary: '更新直播商品', description: '更新直播商品信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async updateLiveGoods(@Param('id') id: string, @Body() updateLiveGoodsDto: UpdateLiveGoodsDto) {
    const data = await this.liveGoodsService.update(id, updateLiveGoodsDto);
    return {
      code: HttpStatus.OK,
      message: '更新成功',
      data
    };
  }

  @Delete('goods/:id')
  @ApiOperation({ summary: '删除直播商品', description: '删除指定的直播商品' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async deleteLiveGoods(@Param('id') id: string) {
    await this.liveGoodsService.remove(id);
    return {
      code: HttpStatus.OK,
      message: '删除成功'
    };
  }

  @Post('goods/:id/on-sale')
  @ApiOperation({ summary: '上架直播商品', description: '上架指定的直播商品' })
  @ApiResponse({ status: 200, description: '上架成功' })
  @ApiResponse({ status: 400, description: '商品已经上架' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async onSaleLiveGoods(@Param('id') id: string) {
    const data = await this.liveGoodsService.onSale(id);
    return {
      code: HttpStatus.OK,
      message: '上架成功',
      data
    };
  }

  @Post('goods/:id/off-sale')
  @ApiOperation({ summary: '下架直播商品', description: '下架指定的直播商品' })
  @ApiResponse({ status: 200, description: '下架成功' })
  @ApiResponse({ status: 400, description: '商品已经下架' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async offSaleLiveGoods(@Param('id') id: string) {
    const data = await this.liveGoodsService.offSale(id);
    return {
      code: HttpStatus.OK,
      message: '下架成功',
      data
    };
  }

  @Get('orders')
  @ApiOperation({ summary: '获取直播订单列表', description: '获取所有直播订单列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getLiveOrders(@Query() paginationDto: PaginationDto) {
    const [data, total] = await this.liveOrderService.findAll(paginationDto);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: { list: data, total, page: paginationDto.page, limit: paginationDto.limit }
    };
  }

  @Put('orders/:id/status')
  @ApiOperation({ summary: '更新订单状态', description: '更新直播订单状态' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '订单状态错误' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string; paymentMethod?: string; paymentTransactionId?: string }
  ) {
    const data = await this.liveOrderService.updateStatus(id, body.status, {
      paymentMethod: body.paymentMethod,
      paymentTransactionId: body.paymentTransactionId
    });
    return {
      code: HttpStatus.OK,
      message: '更新成功',
      data
    };
  }

  @Post('orders/:id/refund')
  @ApiOperation({ summary: '订单退款', description: '对直播订单进行退款处理' })
  @ApiResponse({ status: 200, description: '退款成功' })
  @ApiResponse({ status: 400, description: '订单状态错误或退款金额超过订单金额' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async refundOrder(
    @Param('id') id: string,
    @Body() body: { refundAmount: number; refundReason: string }
  ) {
    const data = await this.liveOrderService.refund(id, body.refundAmount, body.refundReason);
    return {
      code: HttpStatus.OK,
      message: '退款成功',
      data
    };
  }

  @Get('rooms/:id/statistics')
  @ApiOperation({ summary: '获取直播间统计', description: '获取直播间的统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async getLiveRoomStatistics(@Param('id') id: string) {
    const data = await this.liveOrderService.getStatisticsByLiveRoomId(id);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data
    };
  }

  @Delete('chat/:id')
  @ApiOperation({ summary: '删除聊天消息', description: '删除指定的聊天消息（管理员操作）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 400, description: '消息已经被删除' })
  @ApiResponse({ status: 404, description: '消息不存在' })
  async deleteChatMessage(
    @Param('id') id: string,
    @Body() body: { deletedBy: string; reason: string }
  ) {
    const data = await this.liveChatService.deleteMessage(id, body.deletedBy, body.reason);
    return {
      code: HttpStatus.OK,
      message: '删除成功',
      data
    };
  }

  @Post('chat/:id/report')
  @ApiOperation({ summary: '举报聊天消息', description: '举报指定的聊天消息' })
  @ApiResponse({ status: 200, description: '举报成功' })
  @ApiResponse({ status: 400, description: '消息已经被删除' })
  @ApiResponse({ status: 404, description: '消息不存在' })
  async reportChatMessage(@Param('id') id: string) {
    const data = await this.liveChatService.reportMessage(id);
    return {
      code: HttpStatus.OK,
      message: '举报成功',
      data
    };
  }

  @Get('chat/reported')
  @ApiOperation({ summary: '获取被举报的消息', description: '获取所有被举报的聊天消息列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getReportedMessages(@Query() paginationDto: PaginationDto) {
    const [data, total] = await this.liveChatService.getReportedMessages(paginationDto);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: { list: data, total, page: paginationDto.page, limit: paginationDto.limit }
    };
  }

  @Post('rooms/:id/chat/system')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '发送系统消息', description: '在直播间发送系统消息（管理员操作）' })
  @ApiResponse({ status: 201, description: '发送成功' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async sendSystemMessage(
    @Param('id') liveRoomId: string,
    @Body() body: { content: string }
  ) {
    const data = await this.liveChatService.sendSystemMessage(liveRoomId, body.content);
    return {
      code: HttpStatus.CREATED,
      message: '发送成功',
      data
    };
  }

  @Post('rooms/:id/chat/clear')
  @ApiOperation({ summary: '清空聊天记录', description: '清空直播间的聊天记录（管理员操作）' })
  @ApiResponse({ status: 200, description: '清空成功' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async clearChatHistory(
    @Param('id') liveRoomId: string,
    @Body() body: { deletedBy: string }
  ) {
    await this.liveChatService.clearChatHistory(liveRoomId, body.deletedBy);
    return {
      code: HttpStatus.OK,
      message: '清空成功'
    };
  }
}