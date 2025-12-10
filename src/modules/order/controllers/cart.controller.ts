import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { CartEntity } from '../entities/cart.entity';

@ApiTags('购物车管理')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  @ApiOperation({ summary: '添加商品到购物车' })
  @ApiResponse({ status: 200, description: '添加成功', type: CartEntity })
  async addToCart(
    @Body() cartData: {
      memberId: string;
      goodsId: string;
      goodsName: string;
      goodsImage: string;
      goodsPrice: number;
      goodsNum?: number;
      categoryId?: string;
      categoryName?: string;
      goodsSpec?: string;
      skuId?: string;
      skuName?: string;
      skuPrice?: number;
      skuStock?: number;
      skuImage?: string;
      storeId?: string;
      storeName?: string;
    },
    @Request() req
  ) {
    const memberId = cartData.memberId || req.user?.sub;
    return await this.cartService.addToCart({
      ...cartData,
      memberId,
    });
  }

  @Get('list/:memberId')
  @ApiOperation({ summary: '获取用户购物车列表' })
  @ApiParam({ name: 'memberId', description: '用户ID' })
  @ApiQuery({ name: 'status', required: false, description: '购物车状态' })
  @ApiResponse({ status: 200, description: '获取成功', type: [CartEntity] })
  async getCartItems(
    @Param('memberId') memberId: string,
    @Query('status') status?: string,
    @Request() req
  ) {
    const userId = memberId || req.user?.sub;
    return await this.cartService.getCartItems(userId, status);
  }

  @Put('update/:cartId')
  @ApiOperation({ summary: '更新购物车商品数量' })
  @ApiParam({ name: 'cartId', description: '购物车项ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: CartEntity })
  async updateCartItemQuantity(
    @Param('cartId') cartId: string,
    @Body() data: { quantity: number },
    @Request() req
  ) {
    const memberId = req.user?.sub;
    return await this.cartService.updateCartItemQuantity(cartId, memberId, data.quantity);
  }

  @Delete('remove/:cartId')
  @ApiOperation({ summary: '删除购物车商品' })
  @ApiParam({ name: 'cartId', description: '购物车项ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async removeCartItem(@Param('cartId') cartId: string, @Request() req) {
    const memberId = req.user?.sub;
    return await this.cartService.removeCartItem(cartId, memberId);
  }

  @Delete('batch')
  @ApiOperation({ summary: '批量删除购物车商品' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async removeCartItems(
    @Body() data: { cartIds: string[] },
    @Request() req
  ) {
    const memberId = req.user?.sub;
    return await this.cartService.removeCartItems(data.cartIds, memberId);
  }

  @Delete('clear/:memberId')
  @ApiOperation({ summary: '清空购物车' })
  @ApiParam({ name: 'memberId', description: '用户ID' })
  @ApiResponse({ status: 200, description: '清空成功' })
  async clearCart(@Param('memberId') memberId: string, @Request() req) {
    const userId = memberId || req.user?.sub;
    return await this.cartService.clearCart(userId);
  }

  @Put('select/:cartId')
  @ApiOperation({ summary: '选中/取消选中购物车商品' })
  @ApiParam({ name: 'cartId', description: '购物车项ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: CartEntity })
  async selectCartItem(
    @Param('cartId') cartId: string,
    @Body() data: { selected: boolean },
    @Request() req
  ) {
    const memberId = req.user?.sub;
    return await this.cartService.selectCartItem(cartId, memberId, data.selected);
  }

  @Put('select-all/:memberId')
  @ApiOperation({ summary: '全选/取消全选购物车商品' })
  @ApiParam({ name: 'memberId', description: '用户ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async selectAllCartItems(
    @Param('memberId') memberId: string,
    @Body() data: { selected: boolean },
    @Request() req
  ) {
    const userId = memberId || req.user?.sub;
    return await this.cartService.selectAllCartItems(userId, data.selected);
  }

  @Get('selected/:memberId')
  @ApiOperation({ summary: '获取选中的购物车商品' })
  @ApiParam({ name: 'memberId', description: '用户ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: [CartEntity] })
  async getSelectedCartItems(@Param('memberId') memberId: string, @Request() req) {
    const userId = memberId || req.user?.sub;
    return await this.cartService.getSelectedCartItems(userId);
  }

  @Get('statistics/:memberId')
  @ApiOperation({ summary: '获取购物车统计信息' })
  @ApiParam({ name: 'memberId', description: '用户ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCartStatistics(@Param('memberId') memberId: string, @Request() req) {
    const userId = memberId || req.user?.sub;
    return await this.cartService.getCartStatistics(userId);
  }

  @Get('stock-check/:memberId')
  @ApiOperation({ summary: '检查购物车商品库存' })
  @ApiParam({ name: 'memberId', description: '用户ID' })
  @ApiResponse({ status: 200, description: '检查完成' })
  async checkCartStock(@Param('memberId') memberId: string, @Request() req) {
    const userId = memberId || req.user?.sub;
    return await this.cartService.checkCartStock(userId);
  }

  @Post('checkout/:memberId')
  @ApiOperation({ summary: '获取购物车商品用于结算' })
  @ApiParam({ name: 'memberId', description: '用户ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: [CartEntity] })
  async getCartItemsForCheckout(
    @Param('memberId') memberId: string,
    @Body() data: { cartIds?: string[] },
    @Request() req
  ) {
    const userId = memberId || req.user?.sub;
    return await this.cartService.getCartItemsForCheckout(userId, data.cartIds);
  }

  @Post('merge/:memberId')
  @ApiOperation({ summary: '合并购物车' })
  @ApiParam({ name: 'memberId', description: '用户ID' })
  @ApiResponse({ status: 200, description: '合并成功' })
  async mergeCart(
    @Param('memberId') memberId: string,
    @Body() data: { guestCartItems: Partial<CartEntity>[] },
    @Request() req
  ) {
    const userId = memberId || req.user?.sub;
    return await this.cartService.mergeCart(userId, data.guestCartItems);
  }

  @Put('price/:cartId')
  @ApiOperation({ summary: '更新购物车商品价格' })
  @ApiParam({ name: 'cartId', description: '购物车项ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: CartEntity })
  async updateCartItemPrice(
    @Param('cartId') cartId: string,
    @Body() data: { newPrice: number }
  ) {
    return await this.cartService.updateCartItemPrice(cartId, data.newPrice);
  }
}