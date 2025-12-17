import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CartsService } from './carts.service';

@Controller('trade/carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  // 获取购物车列表
  @Get()
  async getCartList(@Query() query: any) {
    return this.cartsService.getCartList(query);
  }

  // 添加商品到购物车
  @Post()
  async addToCart(@Body() body: any) {
    return this.cartsService.addToCart(body);
  }

  // 修改购物车商品数量
  @Put(':id')
  async updateCartItem(@Param('id') id: string, @Body() body: any) {
    return this.cartsService.updateCartItem(id, body);
  }

  // 删除购物车商品
  @Delete(':id')
  async deleteCartItem(@Param('id') id: string) {
    return this.cartsService.deleteCartItem(id);
  }

  // 批量删除购物车商品
  @Delete('batch')
  async batchDeleteCartItems(@Body() body: any) {
    return this.cartsService.batchDeleteCartItems(body);
  }

  // 清空购物车
  @Delete('clear')
  async clearCart() {
    return this.cartsService.clearCart();
  }

  // 获取购物车商品数量
  @Get('count')
  async getCartCount() {
    return this.cartsService.getCartCount();
  }

  // 合并购物车
  @Post('merge')
  async mergeCart(@Body() body: any) {
    return this.cartsService.mergeCart(body);
  }

  // 选中购物车商品
  @Put('select/:id')
  async selectCartItem(@Param('id') id: string) {
    return this.cartsService.selectCartItem(id);
  }

  // 取消选中购物车商品
  @Put('unselect/:id')
  async unselectCartItem(@Param('id') id: string) {
    return this.cartsService.unselectCartItem(id);
  }

  // 批量选中购物车商品
  @Put('select/batch')
  async batchSelectCartItems(@Body() body: any) {
    return this.cartsService.batchSelectCartItems(body);
  }

  // 批量取消选中购物车商品
  @Put('unselect/batch')
  async batchUnselectCartItems(@Body() body: any) {
    return this.cartsService.batchUnselectCartItems(body);
  }

  // 全选购物车商品
  @Put('select/all')
  async selectAllCartItems() {
    return this.cartsService.selectAllCartItems();
  }

  // 取消全选购物车商品
  @Put('unselect/all')
  async unselectAllCartItems() {
    return this.cartsService.unselectAllCartItems();
  }

  // 获取购物车结算信息
  @Get('settlement')
  async getSettlementInfo() {
    return this.cartsService.getSettlementInfo();
  }

  // 购物车商品价格计算
  @Post('calculate')
  async calculateCartPrice(@Body() body: any) {
    return this.cartsService.calculateCartPrice(body);
  }
}