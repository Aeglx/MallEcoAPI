import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { QueryOrderDto, DeliverOrderDto, UpdateOrderRemarkDto } from './dto/order.dto';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator';

@ApiTags('商家端-订单管理')
@Controller('seller/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  @ApiQuery({ name: 'orderSn', required: false, description: '订单编号' })
  @ApiQuery({ name: 'orderStatus', required: false, description: '订单状态' })
  @ApiQuery({ name: 'payStatus', required: false, description: '支付状态' })
  @ApiQuery({ name: 'shipStatus', required: false, description: '物流状态' })
  @ApiQuery({ name: 'consigneeName', required: false, description: '收货人姓名' })
  @ApiQuery({ name: 'consigneeMobile', required: false, description: '收货人电话' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间' })
  @ApiQuery({ name: 'page', required: false, description: '当前页码', default: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数', default: 10 })
  async getOrderList(
    @CurrentUser('storeId') storeId: string,
    @Query() queryDto: QueryOrderDto,
  ) {
    return await this.ordersService.getOrderList(storeId, queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async getOrderDetail(
    @CurrentUser('storeId') storeId: string,
    @Param('id') id: string,
  ) {
    return await this.ordersService.getOrderDetail(storeId, id);
  }

  @Post(':orderSn/deliver')
  @ApiOperation({ summary: '订单发货' })
  @ApiParam({ name: 'orderSn', description: '订单编号' })
  @ApiBody({ type: DeliverOrderDto })
  async deliverOrder(
    @CurrentUser('storeId') storeId: string,
    @Param('orderSn') orderSn: string,
    @Body() deliverDto: DeliverOrderDto,
  ) {
    return await this.ordersService.deliverOrder(storeId, orderSn, deliverDto);
  }

  @Patch(':id/remark')
  @ApiOperation({ summary: '修改订单备注' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiBody({ type: UpdateOrderRemarkDto })
  async updateOrderRemark(
    @CurrentUser('storeId') storeId: string,
    @Param('id') id: string,
    @Body() remarkDto: UpdateOrderRemarkDto,
  ) {
    return await this.ordersService.updateOrderRemark(storeId, id, remarkDto);
  }

  @Get('statistics/data')
  @ApiOperation({ summary: '获取订单统计数据' })
  @ApiQuery({ name: 'startTime', required: true, description: '开始时间' })
  @ApiQuery({ name: 'endTime', required: true, description: '结束时间' })
  async getOrderStatistics(
    @CurrentUser('storeId') storeId: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return await this.ordersService.getOrderStatistics(storeId, startTime, endTime);
  }
}