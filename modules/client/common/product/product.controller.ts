import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('商品管理')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: '创建商品' })
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: '获取商品列表' })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false })
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return await this.productService.findByPage(Number(page), Number(limit));
    }
    return await this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取商品详情' })
  @ApiParam({ name: 'id', description: '商品ID' })
  async findOne(@Param('id') id: string) {
    return await this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return await this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  async remove(@Param('id') id: string) {
    return await this.productService.remove(id);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: '根据分类获取商品' })
  @ApiParam({ name: 'categoryId', description: '分类ID' })
  async findByCategory(@Param('categoryId') categoryId: string) {
    return await this.productService.findByCategory(categoryId);
  }

  @Get('brand/:brandId')
  @ApiOperation({ summary: '根据品牌获取商品' })
  @ApiParam({ name: 'brandId', description: '品牌ID' })
  async findByBrand(@Param('brandId') brandId: string) {
    return await this.productService.findByBrand(brandId);
  }
}
