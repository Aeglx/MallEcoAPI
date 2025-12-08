import { Controller, Get, Post, Body, Patch, Put, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { PageQueryDto } from 'src/shared/dto/page-query.dto';
import { ApiPaginationQuery } from 'src/shared/decorators/api-pagination.decorator';
import { OrderStatus, PayStatus, ShipStatus } from './enum/order-status.enum';

@ApiTags('订单管理')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: '创建订单' })
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.orderService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false })
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return await this.orderService.findByPage(Number(page), Number(limit));
    }
    return await this.orderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async findOne(@Param('id') id: string) {
    return await this.orderService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新订单' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return await this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除订单' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return await this.orderService.remove(id);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: '根据会员ID获取订单列表' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @UseGuards(JwtAuthGuard)
  async findByMemberId(@Param('memberId') memberId: string) {
    return await this.orderService.findByMemberId(memberId);
  }

  @Get('status/:orderStatus')
  @ApiOperation({ summary: '根据订单状态获取订单列表' })
  @ApiParam({ name: 'orderStatus', description: '订单状态' })
  @UseGuards(JwtAuthGuard)
  async findByOrderStatus(@Param('orderStatus') orderStatus: string) {
    return await this.orderService.findByOrderStatus(Number(orderStatus));
  }

  @Get('orderSn/:orderSn')
  @ApiOperation({ summary: '根据订单编号获取订单' })
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'orderSn', description: '订单编号' })
  async findByOrderSn(@Param('orderSn') orderSn: string) {
    return await this.orderService.findByOrderSn(orderSn);
  }

  @Post(':orderSn/pay')
  @ApiOperation({ summary: '支付订单' })
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'orderSn', description: '订单编号' })
  async payOrder(
    @Param('orderSn') orderSn: string,
    @Body('payType') payType: string,
    @Body('payOrderNo') payOrderNo: string,
  ) {
    return await this.orderService.payOrder(orderSn, payType, payOrderNo);
  }

  @Post(':orderSn/cancel')
  @ApiOperation({ summary: '取消订单' })
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'orderSn', description: '订单编号' })
  async cancelOrder(
    @Param('orderSn') orderSn: string,
    @Body('cancelReason') cancelReason: string,
  ) {
    return await this.orderService.cancelOrder(orderSn, cancelReason);
  }

  @Post(':orderSn/deliver')
  @ApiOperation({ summary: '发货' })
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'orderSn', description: '订单编号' })
  async deliverOrder(
    @Param('orderSn') orderSn: string,
    @Body('trackingNo') trackingNo: string,
    @Body('logisticsCompany') logisticsCompany: string,
  ) {
    return await this.orderService.deliverOrder(orderSn, trackingNo, logisticsCompany);
  }

  @Post(':orderSn/confirm')
  @ApiOperation({ summary: '确认收货' })
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'orderSn', description: '订单编号' })
  async confirmOrder(@Param('orderSn') orderSn: string) {
    return await this.orderService.confirmOrder(orderSn);
  }

  @Put(':orderSn/price')
  @ApiOperation({ summary: '更新订单价格' })
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'orderSn', description: '订单编号' })
  async updateOrderPrice(
    @Param('orderSn') orderSn: string,
    @Body('updatePrice') updatePrice: number,
  ) {
    return await this.orderService.updateOrderPrice(orderSn, updatePrice);
  }
}
