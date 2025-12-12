import { Controller, Get, Post, Body, Patch, Delete, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto, UpdateCartSelectedDto } from './dto/update-cart.dto';

@ApiTags('买家端-购物车管理')
@Controller('buyer/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: '添加商品到购物车' })
  @ApiBody({ type: AddToCartDto })
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    const userId = req.user?.id;
    return await this.cartService.addToCart(userId, addToCartDto);
  }

  @Get()
  @ApiOperation({ summary: '获取购物车列表' })
  async getCartList(@Request() req) {
    const userId = req.user?.id;
    return await this.cartService.getCartList(userId);
  }

  @Patch()
  @ApiOperation({ summary: '更新购物车商品' })
  @ApiBody({ type: UpdateCartDto })
  async updateCart(@Request() req, @Body() updateCartDto: UpdateCartDto) {
    const userId = req.user?.id;
    return await this.cartService.updateCart(userId, updateCartDto);
  }

  @Patch('selected')
  @ApiOperation({ summary: '更新购物车商品选中状态' })
  @ApiBody({ type: UpdateCartSelectedDto })
  async updateCartSelected(@Request() req, @Body() updateCartSelectedDto: UpdateCartSelectedDto) {
    const userId = req.user?.id;
    return await this.cartService.updateCartSelected(userId, updateCartSelectedDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除购物车商品' })
  async removeFromCart(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id;
    return await this.cartService.removeFromCart(userId, id);
  }

  @Delete('batch/delete')
  @ApiOperation({ summary: '批量删除购物车商品' })
  async batchRemoveFromCart(@Request() req, @Body() { ids }: { ids: string[] }) {
    const userId = req.user?.id;
    return await this.cartService.batchRemoveFromCart(userId, ids);
  }

  @Delete()
  @ApiOperation({ summary: '清空购物车' })
  async clearCart(@Request() req) {
    const userId = req.user?.id;
    return await this.cartService.clearCart(userId);
  }
}
