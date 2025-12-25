import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TradeService } from './trade.service';

@ApiTags('交易管理')
@Controller('buyer/trade')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  // 购物车相关API
  @Get('carts/all')
  async cartGoodsAll() {
    return this.tradeService.cartGoodsAll();
  }

  @Get('carts/count')
  async cartCount() {
    return this.tradeService.cartCount();
  }

  @Get('carts/checked')
  async cartGoodsPay(@Query() params: any) {
    return this.tradeService.cartGoodsPay(params);
  }

  @Post('carts')
  async addCartGoods(@Body() params: any) {
    return this.tradeService.addCartGoods(params);
  }

  @Delete('carts')
  async clearCart() {
    return this.tradeService.clearCart();
  }

  @Post('carts/create/trade')
  async createTrade(@Body() data: any) {
    return this.tradeService.createTrade(data);
  }

  @Get('carts/select/coupon')
  async selectCoupon(@Query() params: any) {
    return this.tradeService.selectCoupon(params);
  }

  @Get('carts/coupon/num')
  async couponNum(@Query() params: any) {
    return this.tradeService.couponNum(params);
  }

  @Get('carts/shippingAddress')
  async selectAddr(@Query() params: any) {
    return this.tradeService.selectAddr(params);
  }

  @Post('carts/sku/checked')
  async setCheckedAll(@Body() params: any) {
    return this.tradeService.setCheckedAll(params);
  }

  @Post('carts/store/:storeId')
  async setCheckedSeller(@Param('storeId') storeId: string, @Body() params: any) {
    return this.tradeService.setCheckedSeller(storeId, params);
  }

  @Post('carts/sku/checked/:skuId')
  async setCheckedGoods(@Param('skuId') skuId: string, @Body() params: any) {
    return this.tradeService.setCheckedGoods(skuId, params);
  }

  @Post('carts/sku/num/:skuId')
  async setCartGoodsNum(@Param('skuId') skuId: string, @Body() params: any) {
    return this.tradeService.setCartGoodsNum(skuId, params);
  }

  @Delete('carts/sku/remove')
  async delCartGoods(@Query() params: any) {
    return this.tradeService.delCartGoods(params);
  }

  @Get('carts/shippingMethod')
  async shippingMethod(@Query() params: any) {
    return this.tradeService.shippingMethod(params);
  }

  @Get('carts/select/receipt')
  async receiptSelect(@Query() params: any) {
    return this.tradeService.receiptSelect(params);
  }

  @Get('carts/shippingMethodList')
  async shippingMethodList(@Query() params: any) {
    return this.tradeService.shippingMethodList(params);
  }

  @Get('carts/storeAddress')
  async setStoreAddressId(@Query() params: any) {
    return this.tradeService.setStoreAddressId(params);
  }

  @Put('carts/shippingMethod')
  async setShipMethod(@Body() params: any) {
    return this.tradeService.setShipMethod(params);
  }

  // 发票相关API
  @Get('receipt')
  async receiptList() {
    return this.tradeService.receiptList();
  }

  @Post('receipt')
  async saveReceipt(@Body() params: any) {
    return this.tradeService.saveReceipt(params);
  }

  // 充值相关API
  @Post('recharge')
  async recharge(@Body() params: any) {
    return this.tradeService.recharge(params);
  }
}