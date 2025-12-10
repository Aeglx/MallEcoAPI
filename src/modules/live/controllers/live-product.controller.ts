import { Controller, Post, Get, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LiveProductService } from '../services/live-product.service';

@ApiTags('live-product')
@Controller('live/products')
export class LiveProductController {
  constructor(private readonly liveProductService: LiveProductService) {}

  @Post('room/:roomId')
  @ApiOperation({ summary: '添加商品到直播间' })
  @ApiResponse({ status: 201, description: '商品添加成功' })
  async addProductToRoom(
    @Param('roomId') roomId: string,
    @Body() productData: any
  ) {
    return await this.liveProductService.addProductToRoom(roomId, productData);
  }

  @Delete(':productId')
  @ApiOperation({ summary: '从直播间移除商品' })
  @ApiResponse({ status: 200, description: '商品移除成功' })
  async removeProductFromRoom(@Param('productId') productId: string) {
    await this.liveProductService.removeProductFromRoom(productId);
    return { message: '商品移除成功' };
  }

  @Get('room/:roomId')
  @ApiOperation({ summary: '获取直播间商品列表' })
  async getRoomProducts(@Param('roomId') roomId: string) {
    return await this.liveProductService.getRoomProducts(roomId);
  }

  @Get(':productId')
  @ApiOperation({ summary: '获取商品详情' })
  async getProductDetail(@Param('productId') productId: string) {
    return await this.liveProductService.getProductDetail(productId);
  }

  @Put('room/:roomId/sort')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新商品排序' })
  async updateProductSort(
    @Param('roomId') roomId: string,
    @Body('productIds') productIds: string[]
  ) {
    await this.liveProductService.updateProductSort(roomId, productIds);
    return { message: '商品排序更新成功' };
  }

  @Put(':productId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新商品状态' })
  async updateProductStatus(
    @Param('productId') productId: string,
    @Body('isActive') isActive: boolean
  ) {
    await this.liveProductService.updateProductStatus(productId, isActive);
    return { message: '商品状态更新成功' };
  }

  @Get('room/:roomId/hot')
  @ApiOperation({ summary: '获取直播间热销商品' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制' })
  async getHotProducts(
    @Param('roomId') roomId: string,
    @Query('limit') limit: number = 10
  ) {
    return await this.liveProductService.getHotProducts(roomId, limit);
  }

  @Put(':productId/sales')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '增加商品销量' })
  async increaseProductSales(
    @Param('productId') productId: string,
    @Body('quantity') quantity: number = 1
  ) {
    await this.liveProductService.increaseProductSales(productId, quantity);
    return { message: '商品销量更新成功' };
  }
}