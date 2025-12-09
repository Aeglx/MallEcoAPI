import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto/product.dto';

@ApiTags('Seller - Products')
@Controller('seller/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: '创建商品' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.createProduct(createProductDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取商品详情' })
  @ApiParam({ name: 'id', description: '商品ID', example: '1' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async getProductById(@Param('id') id: string) {
    return await this.productsService.getProductById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新商品信息' })
  @ApiParam({ name: 'id', description: '商品ID', example: '1' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return await this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除商品' })
  @ApiParam({ name: 'id', description: '商品ID', example: '1' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async deleteProduct(@Param('id') id: string) {
    return await this.productsService.deleteProduct(id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: '上架商品' })
  @ApiParam({ name: 'id', description: '商品ID', example: '1' })
  @ApiResponse({ status: 200, description: '上架成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async publishProduct(@Param('id') id: string) {
    return await this.productsService.publishProduct(id);
  }

  @Patch(':id/unpublish')
  @ApiOperation({ summary: '下架商品' })
  @ApiParam({ name: 'id', description: '商品ID', example: '1' })
  @ApiResponse({ status: 200, description: '下架成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async unpublishProduct(@Param('id') id: string) {
    return await this.productsService.unpublishProduct(id);
  }

  @Patch(':id/set-new')
  @ApiOperation({ summary: '设置商品为新品' })
  @ApiParam({ name: 'id', description: '商品ID', example: '1' })
  @ApiResponse({ status: 200, description: '设置成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async setNew(@Param('id') id: string) {
    return await this.productsService.setNew(id);
  }

  @Patch(':id/unset-new')
  @ApiOperation({ summary: '取消商品新品标记' })
  @ApiParam({ name: 'id', description: '商品ID', example: '1' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async unsetNew(@Param('id') id: string) {
    return await this.productsService.unsetNew(id);
  }

  @Patch(':id/set-hot')
  @ApiOperation({ summary: '设置商品为热门' })
  @ApiParam({ name: 'id', description: '商品ID', example: '1' })
  @ApiResponse({ status: 200, description: '设置成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async setHot(@Param('id') id: string) {
    return await this.productsService.setHot(id);
  }

  @Patch(':id/unset-hot')
  @ApiOperation({ summary: '取消商品热门标记' })
  @ApiParam({ name: 'id', description: '商品ID', example: '1' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async unsetHot(@Param('id') id: string) {
    return await this.productsService.unsetHot(id);
  }

  @Get()
  @ApiOperation({ summary: '获取商品列表' })
  @ApiQuery({ name: 'name', description: '商品名称', required: false })
  @ApiQuery({ name: 'categoryId', description: '商品分类ID', required: false })
  @ApiQuery({ name: 'isShow', description: '是否上架', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', description: '每页条数', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProducts(@Query() query: QueryProductDto) {
    return await this.productsService.getProducts(query);
  }
}
