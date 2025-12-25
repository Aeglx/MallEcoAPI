import { Controller, Get, Post, Body, Put, Delete, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrdersFullService } from '../services/orders-full.service';

@ApiTags('订单管理')
@Controller('order')
export class OrdersFullController {
  constructor(private readonly ordersFullService: OrdersFullService) {}

  // 订单相关接口
  @Get('order')
  async getOrderList(@Query() query: any) {
    return await this.ordersFullService.getOrderList(query);
  }

  @Get('order/:sn')
  async getOrderDetail(@Param('sn') sn: string) {
    return await this.ordersFullService.getOrderDetail(sn);
  }

  @Post('order/:sn/cancel')
  async cancelOrder(@Param('sn') sn: string, @Body() cancelData: any) {
    return await this.ordersFullService.cancelOrder(sn, cancelData);
  }

  @Put('order/update/:sn/price')
  async modifyOrderPrice(@Param('sn') sn: string, @Body() priceData: any) {
    return await this.ordersFullService.modifyOrderPrice(sn, priceData);
  }

  @Put('order/:sn/sellerRemark')
  async modifyOrderRemark(@Param('sn') sn: string, @Body() remarkData: any) {
    return await this.ordersFullService.modifyOrderRemark(sn, remarkData);
  }

  @Post('order/:sn/delivery')
  async orderDelivery(@Param('sn') sn: string, @Body() deliveryData: any) {
    return await this.ordersFullService.orderDelivery(sn, deliveryData);
  }

  @Put('order/take/:sn/:verificationCode')
  async orderTake(@Param('sn') sn: string, @Param('verificationCode') code: string) {
    return await this.ordersFullService.orderTake(sn, code);
  }

  // 售后相关接口
  @Get('afterSale/page')
  async afterSaleOrderPage(@Query() query: any) {
    return await this.ordersFullService.afterSaleOrderPage(query);
  }

  @Get('afterSale/:sn')
  async afterSaleOrderDetail(@Param('sn') sn: string) {
    return await this.ordersFullService.afterSaleOrderDetail(sn);
  }

  @Put('afterSale/review/:sn')
  async afterSaleSellerReview(@Param('sn') sn: string, @Body() reviewData: any) {
    return await this.ordersFullService.afterSaleSellerReview(sn, reviewData);
  }

  @Put('afterSale/confirm/:sn')
  async afterSaleSellerConfirm(@Param('sn') sn: string, @Body() confirmData: any) {
    return await this.ordersFullService.afterSaleSellerConfirm(sn, confirmData);
  }

  @Post('afterSale/:sn/delivery')
  async afterSaleSellerDelivery(@Param('sn') sn: string, @Body() deliveryData: any) {
    return await this.ordersFullService.afterSaleSellerDelivery(sn, deliveryData);
  }

  // 物流相关接口
  @Get('order/getTraces/:sn')
  async getTraces(@Param('sn') sn: string, @Query() query: any) {
    return await this.ordersFullService.getTraces(sn, query);
  }

  @Get('afterSale/getSellerDeliveryTraces/:sn')
  async getSellerDeliveryTraces(@Param('sn') sn: string, @Query() query: any) {
    return await this.ordersFullService.getSellerDeliveryTraces(sn, query);
  }

  // 发票相关接口
  @Get('trade/receipt')
  async getReceiptPage(@Query() query: any) {
    return await this.ordersFullService.getReceiptPage(query);
  }

  @Post('trade/receipt/:id/invoicing')
  async invoicing(@Param('id') id: string) {
    return await this.ordersFullService.invoicing(id);
  }

  // 统计相关接口
  @Get('order/orderNum')
  async getOrderNum(@Query() query: any) {
    return await this.ordersFullService.getOrderNum(query);
  }

  @Get('afterSale/afterSaleNumVO')
  async getAfterSaleNumVO(@Query() query: any) {
    return await this.ordersFullService.getAfterSaleNumVO(query);
  }

  // 导入导出接口
  @Get('order/queryExportOrder')
  async queryExportOrder(@Query() query: any) {
    return await this.ordersFullService.queryExportOrder(query);
  }

  @Post('order/batchDeliver')
  async uploadDeliverExcel(@Body() deliverData: any) {
    return await this.ordersFullService.uploadDeliverExcel(deliverData);
  }
}