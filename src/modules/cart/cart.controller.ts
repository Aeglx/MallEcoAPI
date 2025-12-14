import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Cart } from './entities/cart.entity';

@ApiTags('购物车管理')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: '获取用户购物车列表' })
  @ApiResponse({ status: 200, description: '查询成功', type: [Cart] })
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<Cart[]> {
    return this.cartService.findByUserId(userId);
  }

  @ApiOperation({ summary: '根据ID获取购物车商品' })
  @ApiParam({ name: 'id', description: '购物车商品ID' })
  @ApiResponse({ status: 200, description: '查询成功', type: Cart })
  @ApiResponse({ status: 404, description: '购物车商品不存在' })
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Cart> {
    const cart = await this.cartService.findById(id);
    if (!cart) {
      throw new Error('购物车商品不存在');
    }
    return cart;
  }

  @ApiOperation({ summary: '添加商品到购物车' })
  @ApiBody({ type: AddCartItemDto })
  @ApiResponse({ status: 201, description: '添加成功', type: Cart })
  @ApiResponse({ status: 400, description: '参数错误' })
  @Post()
  async addItem(@Query('userId') userId: string, @Body() addCartItemDto: AddCartItemDto): Promise<Cart> {
    return this.cartService.addItem(userId, addCartItemDto);
  }

  @ApiOperation({ summary: '更新购物车商品' })
  @ApiParam({ name: 'id', description: '购物车商品ID' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: '更新成功', type: Cart })
  @ApiResponse({ status: 404, description: '购物车商品不存在' })
  @Put(':id')
  async updateItem(@Param('id') id: string, @Body() updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    return this.cartService.updateItem(id, updateCartItemDto);
  }

  @ApiOperation({ summary: '批量更新购物车商品选中状态' })
  @ApiBody({ schema: { example: { selected: true, ids: ['1', '2'] } } })
  @ApiResponse({ status: 200, description: '更新成功' })
  @Put('selected')
  async updateItemsSelected(
    @Query('userId') userId: string,
    @Body('selected') selected: boolean,
    @Body('ids') ids?: string[]
  ): Promise<void> {
    return this.cartService.updateItemsSelected(userId, selected, ids);
  }

  @ApiOperation({ summary: '删除购物车商品' })
  @ApiParam({ name: 'id', description: '购物车商品ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '购物车商品不存在' })
  @Delete(':id')
  async removeItem(@Param('id') id: string): Promise<void> {
    return this.cartService.removeItem(id);
  }

  @ApiOperation({ summary: '批量删除购物车商品' })
  @ApiBody({ schema: { example: { ids: ['1', '2'] } } })
  @ApiResponse({ status: 200, description: '删除成功' })
  @Delete()
  async removeItems(@Body('ids') ids: string[]): Promise<void> {
    return this.cartService.removeItems(ids);
  }

  @ApiOperation({ summary: '清空购物车' })
  @ApiResponse({ status: 200, description: '清空成功' })
  @Delete('clear/:userId')
  async clearCart(@Param('userId') userId: string): Promise<void> {
    return this.cartService.clearCart(userId);
  }

  @ApiOperation({ summary: '获取购物车统计信息' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @Get('statistics/:userId')
  async getCartStatistics(@Param('userId') userId: string): Promise<{
    totalItems: number;
    totalPrice: number;
    selectedItems: number;
    selectedPrice: number;
  }> {
    return this.cartService.getCartStatistics(userId);
  }
}
