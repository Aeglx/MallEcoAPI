import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

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
  async remove(@Param('id') id: string) {
    return await this.orderService.remove(id);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: '根据会员ID获取订单列表' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  async findByMemberId(@Param('memberId') memberId: string) {
    return await this.orderService.findByMemberId(memberId);
  }

  @Get('status/:orderStatus')
  @ApiOperation({ summary: '根据订单状态获取订单列表' })
  @ApiParam({ name: 'orderStatus', description: '订单状态' })
  async findByOrderStatus(@Param('orderStatus') orderStatus: string) {
    return await this.orderService.findByOrderStatus(Number(orderStatus));
  }
}
