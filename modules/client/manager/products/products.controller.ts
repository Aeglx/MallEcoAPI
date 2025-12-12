import { Controller, Post, Get, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ManagerProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto/product.dto';
import { Product } from '../../common/product/entities/product.entity';

@ApiTags('Manager - Products')
@Controller('manager/products')
export class ManagerProductsController {
  constructor(private readonly productsService: ManagerProductsService) {}

  @Post()
  @ApiOperation({ summary: '创建产品' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async createProduct(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return await this.productsService.createProduct(createProductDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取产品详情' })
  @ApiParam({ name: 'id', description: '产品ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async getProductById(@Param('id') id: string): Promise<Product> {
    return await this.productsService.getProductById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新产品' })
  @ApiParam({ name: 'id', description: '产品ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<Product> {
    return await this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除产品' })
  @ApiParam({ name: 'id', description: '产品ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async deleteProduct(@Param('id') id: string): Promise<void> {
    return await this.productsService.deleteProduct(id);
  }

  @Get()
  @ApiOperation({ summary: '获取产品列表' })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false })
  @ApiQuery({ name: 'name', description: '产品名称', required: false })
  @ApiQuery({ name: 'status', description: '产品状态', required: false })
  @ApiQuery({ name: 'categoryId', description: '分类ID', required: false })
  @ApiQuery({ name: 'brandId', description: '品牌ID', required: false })
  @ApiQuery({ name: 'isRecommended', description: '是否推荐', required: false })
  @ApiQuery({ name: 'isHot', description: '是否热门', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProducts(@Query() query: QueryProductDto): Promise<{ data: Product[]; total: number }> {
    return await this.productsService.getProducts(query);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: '发布产品' })
  @ApiParam({ name: 'id', description: '产品ID' })
  @ApiResponse({ status: 200, description: '发布成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async publishProduct(@Param('id') id: string): Promise<Product> {
    return await this.productsService.publishProduct(id);
  }

  @Patch(':id/unpublish')
  @ApiOperation({ summary: '下架产品' })
  @ApiParam({ name: 'id', description: '产品ID' })
  @ApiResponse({ status: 200, description: '下架成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async unpublishProduct(@Param('id') id: string): Promise<Product> {
    return await this.productsService.unpublishProduct(id);
  }

  @Patch(':id/recommend')
  @ApiOperation({ summary: '推荐产品' })
  @ApiParam({ name: 'id', description: '产品ID' })
  @ApiResponse({ status: 200, description: '推荐成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async recommendProduct(@Param('id') id: string): Promise<Product> {
    return await this.productsService.setRecommend(id);
  }

  @Patch(':id/unrecommend')
  @ApiOperation({ summary: '取消推荐产品' })
  @ApiParam({ name: 'id', description: '产品ID' })
  @ApiResponse({ status: 200, description: '取消推荐成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async unrecommendProduct(@Param('id') id: string): Promise<Product> {
    return await this.productsService.unsetRecommend(id);
  }

  @Patch(':id/set-hot')
  @ApiOperation({ summary: '设置热门产品' })
  @ApiParam({ name: 'id', description: '产品ID' })
  @ApiResponse({ status: 200, description: '设置成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async setHotProduct(@Param('id') id: string): Promise<Product> {
    return await this.productsService.setHot(id);
  }

  @Patch(':id/unset-hot')
  @ApiOperation({ summary: '取消热门产品' })
  @ApiParam({ name: 'id', description: '产品ID' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async unsetHotProduct(@Param('id') id: string): Promise<Product> {
    return await this.productsService.removeHot(id);
  }
}
