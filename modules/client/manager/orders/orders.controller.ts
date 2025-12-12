import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ManagerOrdersService } from './orders.service';
import { QueryOrderDto, ShipOrderDto, BatchShipOrderDto } from './dto/order.dto';

@ApiTags('管理端-订单管理')
@Controller('manager/orders')
export class ManagerOrdersController {
  constructor(private readonly ordersService: ManagerOrdersService) {}

  @ApiOperation({ summary: '获取订单列表' })
  @Get()
  getOrders(@Query() query: QueryOrderDto) {
    return this.ordersService.getOrders(query);
  }

  @ApiOperation({ summary: '获取订单详情' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @Get(':id')
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @ApiOperation({ summary: '订单发货' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiBody({ type: ShipOrderDto })
  @Put(':id/ship')
  shipOrder(@Param('id') id: string, @Body() shipData: ShipOrderDto) {
    // 这里假设从请求头或session中获取操作员信息
    const operatorId = 'admin'; // 实际项目中应该从认证信息中获取
    const operatorName = '管理员';
    
    return this.ordersService.shipOrder(id, shipData, operatorId, operatorName);
  }

  @ApiOperation({ summary: '批量发货' })
  @ApiBody({ type: BatchShipOrderDto })
  @Post('batch-ship')
  batchShipOrder(@Body() batchData: BatchShipOrderDto) {
    // 这里假设从请求头或session中获取操作员信息
    const operatorId = 'admin'; // 实际项目中应该从认证信息中获取
    const operatorName = '管理员';
    
    return this.ordersService.batchShipOrder(batchData, operatorId, operatorName);
  }

  @ApiOperation({ summary: '取消订单' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiBody({ schema: { properties: { remark: { type: 'string', description: '取消原因' } } } })
  @Put(':id/cancel')
  cancelOrder(@Param('id') id: string, @Body('remark') remark: string) {
    // 这里假设从请求头或session中获取操作员信息
    const operatorId = 'admin'; // 实际项目中应该从认证信息中获取
    const operatorName = '管理员';
    
    return this.ordersService.cancelOrder(id, remark, operatorId, operatorName);
  }

  @ApiOperation({ summary: '关闭订单' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiBody({ schema: { properties: { remark: { type: 'string', description: '关闭原因' } } } })
  @Put(':id/close')
  closeOrder(@Param('id') id: string, @Body('remark') remark: string) {
    // 这里假设从请求头或session中获取操作员信息
    const operatorId = 'admin'; // 实际项目中应该从认证信息中获取
    const operatorName = '管理员';
    
    return this.ordersService.closeOrder(id, remark, operatorId, operatorName);
  }

  @ApiOperation({ summary: '获取订单统计数据' })
  @ApiQuery({ name: 'startTime', required: true, description: '开始时间' })
  @ApiQuery({ name: 'endTime', required: true, description: '结束时间' })
  @Get('statistics')
  getOrderStatistics(@Query('startTime') startTime: string, @Query('endTime') endTime: string) {
    return this.ordersService.getOrderStatistics(startTime, endTime);
  }
}
