import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { Public } from '../../common/auth/public.decorator';

@ApiTags('买家�?商品管理')
@Controller('buyer/products')
@Public()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: '获取商品列表' })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false })
  @ApiQuery({ name: 'categoryId', description: '分类ID', required: false })
  @ApiQuery({ name: 'brandId', description: '品牌ID', required: false })
  @ApiQuery({ name: 'keyword', description: '搜索关键字', required: false })
  @ApiQuery({ name: 'sortBy', description: '排序字段', required: false })
  @ApiQuery({ name: 'sortOrder', description: '排序顺序(asc/desc)', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const pageNum = page ? Number(page) : 1;
    const pageSize = limit ? Number(limit) : 10;
    // 确保sortOrder是有效的asc或desc�?
    const validSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'asc';
    return await this.productService.findAll(
      pageNum,
      pageSize,
      categoryId,
      brandId,
      keyword,
      sortBy,
      validSortOrder as 'asc' | 'desc',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取商品详情' })
  @ApiParam({ name: 'id', description: '商品ID' })
  async findOne(@Param('id') id: string) {
    return await this.productService.findOne(id);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: '根据分类获取商品' })
  @ApiParam({ name: 'categoryId', description: '分类ID' })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false })
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? Number(page) : 1;
    const pageSize = limit ? Number(limit) : 10;
    return await this.productService.findByCategory(categoryId, pageNum, pageSize);
  }

  @Get('brand/:brandId')
  @ApiOperation({ summary: '根据品牌获取商品' })
  @ApiParam({ name: 'brandId', description: '品牌ID' })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false })
  async findByBrand(
    @Param('brandId') brandId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? Number(page) : 1;
    const pageSize = limit ? Number(limit) : 10;
    return await this.productService.findByBrand(brandId, pageNum, pageSize);
  }
}

