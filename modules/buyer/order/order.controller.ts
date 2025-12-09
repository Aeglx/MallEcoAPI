import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Request } from '@nestjs/common';

@ApiTags('买家端-订单管理')
@Controller('buyer/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: '创建订单' })
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user?.id;
    return await this.orderService.createOrder(userId, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false })
  @ApiQuery({ name: 'status', description: '订单状态', required: false })
  async getOrderList(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const userId = req.user?.id;
    const pageNum = page ? Number(page) : 1;
    const pageSize = limit ? Number(limit) : 10;
    return await this.orderService.getOrderList(userId, pageNum, pageSize, status);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async getOrderDetail(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id;
    return await this.orderService.getOrderDetail(userId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新订单状态' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async updateOrderStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const userId = req.user?.id;
    return await this.orderService.updateOrderStatus(userId, id, updateOrderStatusDto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async cancelOrder(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id;
    return await this.orderService.cancelOrder(userId, id);
  }

  @Post(':id/confirm-receipt')
  @ApiOperation({ summary: '确认收货' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async confirmReceipt(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id;
    return await this.orderService.confirmReceipt(userId, id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: '获取订单日志' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async getOrderLogs(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id;
    return await this.orderService.getOrderLogs(userId, id);
  }
}
