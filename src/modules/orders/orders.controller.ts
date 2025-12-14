import { Controller, Post, Get, Put, Delete, Body, Param, Query, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('订单管理')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * 创建订单
   * @param dto 创建订单DTO
   * @returns 创建的订单
   */
  @Post()
  @ApiOperation({
    summary: '创建订单',
    description: '创建一个新的订单',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '订单创建成功',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '请求参数错误',
  })
  @ApiBody({
    type: CreateOrderDto,
    description: '创建订单的请求体',
  })
  async createOrder(@Body() dto: CreateOrderDto) {
    try {
      const order = await this.ordersService.createOrder(dto);
      return {
        success: true,
        data: order,
        message: '订单创建成功',
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: '订单创建失败',
        error: error.message,
      }, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 获取订单详情
   * @param id 订单ID
   * @returns 订单详情
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取订单详情',
    description: '根据订单ID获取订单详情',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取订单详情成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '订单不存在',
  })
  @ApiParam({
    name: 'id',
    description: '订单ID',
    example: '1765695924450',
  })
  async getOrderById(@Param('id') id: string) {
    const orderWithItems = await this.ordersService.getOrderWithItemsById(id);
    if (!orderWithItems) {
      throw new HttpException({
        success: false,
        message: '订单不存在',
      }, HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      data: orderWithItems,
      message: '获取订单详情成功',
    };
  }

  /**
   * 获取用户订单列表
   * @param userId 用户ID
   * @param status 订单状态（可选）
   * @returns 订单列表
   */
  @Get()
  @ApiOperation({
    summary: '获取用户订单列表',
    description: '根据用户ID获取订单列表，可以按状态筛选',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取订单列表成功',
  })
  @ApiQuery({
    name: 'userId',
    description: '用户ID',
    example: '1',
    required: true,
  })
  @ApiQuery({
    name: 'status',
    description: '订单状态：0-待付款，1-待发货，2-待收货，3-待评价，4-已完成，5-已取消',
    example: 0,
    required: false,
  })
  async getOrdersByUserId(@Query('userId') userId: string, @Query('status') status?: number) {
    const orders = await this.ordersService.getOrdersByUserId(userId, status);
    return {
      success: true,
      data: orders,
      message: '获取订单列表成功',
    };
  }

  /**
   * 更新订单状态
   * @param id 订单ID
   * @param dto 更新订单状态DTO
   * @returns 更新后的订单
   */
  @Put(':id/status')
  @ApiOperation({
    summary: '更新订单状态',
    description: '更新订单的状态',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '订单状态更新成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '订单不存在',
  })
  @ApiParam({
    name: 'id',
    description: '订单ID',
    example: '1765695924450',
  })
  @ApiBody({
    type: UpdateOrderStatusDto,
    description: '更新订单状态的请求体',
  })
  async updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    const order = await this.ordersService.updateOrderStatus(id, dto);
    if (!order) {
      throw new HttpException({
        success: false,
        message: '订单不存在',
      }, HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      data: order,
      message: '订单状态更新成功',
    };
  }

  /**
   * 删除订单
   * @param id 订单ID
   * @returns 删除结果
   */
  @Delete(':id')
  @ApiOperation({
    summary: '删除订单',
    description: '根据订单ID删除订单',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '订单删除成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '订单不存在',
  })
  @ApiParam({
    name: 'id',
    description: '订单ID',
    example: '1765695924450',
  })
  async deleteOrder(@Param('id') id: string) {
    const result = await this.ordersService.deleteOrder(id);
    if (!result) {
      throw new HttpException({
        success: false,
        message: '订单不存在',
      }, HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      message: '订单删除成功',
    };
  }
}
