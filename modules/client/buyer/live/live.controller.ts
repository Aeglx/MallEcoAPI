import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LiveRoomService } from '../../common/live/services/live-room.service';
import { LiveGoodsService } from '../../common/live/services/live-goods.service';
import { LiveOrderService } from '../../common/live/services/live-order.service';
import { LiveChatService } from '../../common/live/services/live-chat.service';
import { CreateLiveOrderDto } from '../../common/live/dto/create-live-order.dto';
import { CreateLiveChatDto } from '../../common/live/dto/create-live-chat.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('买家端-直播')
@Controller('buyer/live')
export class LiveController {
  constructor(
    private readonly liveRoomService: LiveRoomService,
    private readonly liveGoodsService: LiveGoodsService,
    private readonly liveOrderService: LiveOrderService,
    private readonly liveChatService: LiveChatService,
  ) {}

  @Get('rooms')
  @ApiOperation({ summary: '获取直播间列表', description: '获取所有直播间列表，支持分页和筛选' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async getLiveRooms(@Query() paginationDto: PaginationDto) {
    const [data, total] = await this.liveRoomService.findAll(paginationDto);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: { list: data, total, page: paginationDto.page, limit: paginationDto.limit }
    };
  }

  @Get('rooms/hot')
  @ApiOperation({ summary: '获取热门直播间', description: '获取当前热门的直播间列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制' })
  async getHotLiveRooms(@Query('limit') limit: number = 10) {
    const data = await this.liveRoomService.getHotLiveRooms(limit);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data
    };
  }

  @Get('rooms/recommended')
  @ApiOperation({ summary: '获取推荐直播间', description: '获取推荐直播间列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制' })
  async getRecommendedLiveRooms(@Query('limit') limit: number = 10) {
    const data = await this.liveRoomService.getRecommendedLiveRooms(limit);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data
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

  @Get('rooms/:id/goods')
  @ApiOperation({ summary: '获取直播间商品列表', description: '获取指定直播间的商品列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async getLiveRoomGoods(@Param('id') liveRoomId: string, @Query() paginationDto: PaginationDto) {
    const [data, total] = await this.liveGoodsService.findByLiveRoomId(liveRoomId, paginationDto);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: { list: data, total, page: paginationDto.page, limit: paginationDto.limit }
    };
  }

  @Get('rooms/:id/chat')
  @ApiOperation({ summary: '获取直播间聊天记录', description: '获取直播间的聊天记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async getLiveRoomChat(@Param('id') liveRoomId: string, @Query() paginationDto: PaginationDto) {
    const [data, total] = await this.liveChatService.getChatHistory(liveRoomId, paginationDto);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: { list: data, total, page: paginationDto.page, limit: paginationDto.limit }
    };
  }

  @Post('rooms/:id/chat')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '发送聊天消息', description: '在直播间发送聊天消息' })
  @ApiResponse({ status: 201, description: '发送成功' })
  @ApiResponse({ status: 400, description: '直播间未在直播中' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async sendChatMessage(@Param('id') liveRoomId: string, @Body() createLiveChatDto: CreateLiveChatDto) {
    const data = await this.liveChatService.sendMessage({
      ...createLiveChatDto,
      liveRoomId
    });
    return {
      code: HttpStatus.CREATED,
      message: '发送成功',
      data
    };
  }

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建直播订单', description: '创建直播间的订单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async createLiveOrder(@Body() createLiveOrderDto: CreateLiveOrderDto) {
    const data = await this.liveOrderService.create(createLiveOrderDto);
    return {
      code: HttpStatus.CREATED,
      message: '创建成功',
      data
    };
  }

  @Get('orders')
  @ApiOperation({ summary: '获取我的直播订单', description: '获取当前用户的直播订单列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'memberId', required: true, description: '会员ID' })
  async getMyLiveOrders(@Query('memberId') memberId: string, @Query() paginationDto: PaginationDto) {
    const [data, total] = await this.liveOrderService.findByMemberId(memberId, paginationDto);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: { list: data, total, page: paginationDto.page, limit: paginationDto.limit }
    };
  }

  @Get('orders/:id')
  @ApiOperation({ summary: '获取订单详情', description: '根据ID获取直播订单详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async getLiveOrder(@Param('id') id: string) {
    const data = await this.liveOrderService.findOne(id);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data
    };
  }

  @Post('orders/:id/rate')
  @ApiOperation({ summary: '评价订单', description: '对已完成的直播订单进行评价' })
  @ApiResponse({ status: 200, description: '评价成功' })
  @ApiResponse({ status: 400, description: '订单状态错误或已评价' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async rateOrder(
    @Param('id') id: string,
    @Body() body: { rating: number; ratingComment: string }
  ) {
    const data = await this.liveOrderService.rateOrder(id, body.rating, body.ratingComment);
    return {
      code: HttpStatus.OK,
      message: '评价成功',
      data
    };
  }

  @Post('rooms/:id/chat/gift')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '发送礼物', description: '在直播间发送礼物' })
  @ApiResponse({ status: 201, description: '发送成功' })
  @ApiResponse({ status: 400, description: '直播间未在直播中' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async sendGift(
    @Param('id') liveRoomId: string,
    @Body() body: {
      senderId: string;
      senderName: string;
      giftId: string;
      giftName: string;
      giftQuantity: number;
      giftValue: number;
      content: string;
    }
  ) {
    const data = await this.liveChatService.sendGiftMessage({
      liveRoomId,
      senderId: body.senderId,
      senderName: body.senderName,
      messageType: 'GIFT',
      content: body.content,
      giftId: body.giftId,
      giftName: body.giftName,
      giftQuantity: body.giftQuantity,
      giftValue: body.giftValue
    });
    return {
      code: HttpStatus.CREATED,
      message: '发送成功',
      data
    };
  }
}