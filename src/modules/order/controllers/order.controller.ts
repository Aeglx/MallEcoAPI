import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { OrderEntity } from '../entities/order.entity';

@ApiTags('订单管理')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: '创建订单' })
  @ApiResponse({ status: 200, description: '订单创建成功', type: OrderEntity })
  async createOrder(
    @Body() orderData: {
      memberId: string;
      storeId: string;
      totalPrice: number;
      payPrice: number;
      freightPrice: number;
      discountPrice: number;
      receiverName: string;
      receiverPhone: string;
      receiverAddress: string;
      receiverZipCode?: string;
      buyerMessage?: string;
      orderItems: Array<{
        goodsId: string;
        goodsName: string;
        goodsImage: string;
        goodsPrice: number;
        goodsNum: number;
        discountPrice?: number;
        categoryId?: string;
        categoryName?: string;
        goodsSpec?: string;
        skuId?: string;
        skuName?: string;
        skuPrice?: number;
        skuStock?: number;
        skuImage?: string;
      }>;
    }
  ) {
    return await this.orderService.createOrder(orderData, orderData.orderItems);
  }

  @Get(':orderId')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiParam({ name: 'orderId', description: '订单ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: OrderEntity })
  async getOrderById(@Param('orderId') orderId: string, @Request() req) {
    const memberId = req.user?.sub; // 从JWT token获取用户ID
    return await this.orderService.getOrderById(orderId, memberId);
  }

  @Get('sn/:orderSn')
  @ApiOperation({ summary: '根据订单号获取订单' })
  @ApiParam({ name: 'orderSn', description: '订单号' })
  @ApiResponse({ status: 200, description: '获取成功', type: OrderEntity })
  async getOrderBySn(@Param('orderSn') orderSn: string, @Request() req) {
    const memberId = req.user?.sub;
    return await this.orderService.getOrderBySn(orderSn, memberId);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: '获取用户订单列表' })
  @ApiParam({ name: 'memberId', description: '用户ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'orderStatus', required: false, description: '订单状态' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  async getUserOrders(
    @Param('memberId') memberId: string,
    @Query() params: {
      page?: number;
      pageSize?: number;
      orderStatus?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    return await this.orderService.getUserOrders(memberId, params);
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: '获取商家订单列表' })
  @ApiParam({ name: 'storeId', description: '商家ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'orderStatus', required: false, description: '订单状态' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  async getStoreOrders(
    @Param('storeId') storeId: string,
    @Query() params: {
      page?: number;
      pageSize?: number;
      orderStatus?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    return await this.orderService.getStoreOrders(storeId, params);
  }

  @Put(':orderId/status')
  @ApiOperation({ summary: '更新订单状态' })
  @ApiParam({ name: 'orderId', description: '订单ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() data: {
      status: string;
      operatorId?: string;
      remark?: string;
    }
  ) {
    return await this.orderService.updateOrderStatus(
      orderId,
      data.status,
      data.operatorId,
      data.remark
    );
  }

  @Put(':orderId/payment')
  @ApiOperation({ summary: '更新支付状态' })
  @ApiParam({ name: 'orderId', description: '订单ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updatePaymentStatus(
    @Param('orderId') orderId: string,
    @Body() data: {
      paymentStatus: string;
      paymentMethod?: string;
      paymentName?: string;
      payTime?: string;
    }
  ) {
    const paymentInfo = {
      paymentMethod: data.paymentMethod,
      paymentName: data.paymentName,
      payTime: data.payTime ? new Date(data.payTime) : undefined,
    };

    return await this.orderService.updatePaymentStatus(
      orderId,
      data.paymentStatus,
      paymentInfo
    );
  }

  @Put(':orderId/shipping')
  @ApiOperation({ summary: '更新发货状态' })
  @ApiParam({ name: 'orderId', description: '订单ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateShippingStatus(
    @Param('orderId') orderId: string,
    @Body() data: {
      shippingStatus: string;
      shippingSn?: string;
      shippingCompany?: string;
      shippingTime?: string;
    }
  ) {
    const shippingInfo = {
      shippingStatus: data.shippingStatus,
      shippingSn: data.shippingSn,
      shippingCompany: data.shippingCompany,
      shippingTime: data.shippingTime ? new Date(data.shippingTime) : undefined,
    };

    return await this.orderService.updateShippingStatus(orderId, shippingInfo);
  }

  @Put(':orderId/cancel')
  @ApiOperation({ summary: '取消订单' })
  @ApiParam({ name: 'orderId', description: '订单ID' })
  @ApiResponse({ status: 200, description: '取消成功' })
  async cancelOrder(
    @Param('orderId') orderId: string,
    @Body() data: {
      memberId: string;
      cancelReason: string;
    },
    @Request() req
  ) {
    const memberId = data.memberId || req.user?.sub;
    return await this.orderService.cancelOrder(orderId, memberId, data.cancelReason);
  }

  @Put(':orderId/receive')
  @ApiOperation({ summary: '确认收货' })
  @ApiParam({ name: 'orderId', description: '订单ID' })
  @ApiResponse({ status: 200, description: '确认成功' })
  async confirmReceive(@Param('orderId') orderId: string, @Request() req) {
    const memberId = req.user?.sub;
    return await this.orderService.confirmReceive(orderId, memberId);
  }

  @Get('statistics/:memberId')
  @ApiOperation({ summary: '获取订单统计' })
  @ApiParam({ name: 'memberId', description: '用户ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getOrderStatistics(@Param('memberId') memberId: string) {
    return await this.orderService.getOrderStatistics(memberId);
  }

  @Get(':orderId/logs')
  @ApiOperation({ summary: '获取订单日志' })
  @ApiParam({ name: 'orderId', description: '订单ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getOrderLogs(@Param('orderId') orderId: string, @Request() req) {
    const memberId = req.user?.sub;
    return await this.orderService.getOrderLogs(orderId, memberId);
  }
}