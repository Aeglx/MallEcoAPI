import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
// import { Cache, CacheInvalidate } from '../cache/cache.interceptor';
// import { JwtAuthGuard } from './../../infrastructure/auth/guards/jwt-auth.guard';
// import { Public } from './../../infrastructure/auth/public.decorator';

@ApiTags('商品')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // @UseGuards(JwtAuthGuard)  // 生产环境应启用认证
  @Post()
  // @CacheInvalidate(['product_list:*', 'product_detail:*'])
  @ApiOperation({ summary: '创建商品' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  // @Public()
  @Get()
  // @Cache({
  //   ttl: 300, // 5分钟缓存
  //   key: (context) => `product_list:${JSON.stringify(context.getArgs()[0])}`,
  //   condition: (context) => {
  //     const params = context.getArgs()[0];
  //     // 只缓存公开商品列表查询
  //     return params.isShow !== 0;
  //   }
  // })
  @ApiOperation({ summary: '查询商品列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiQuery({ name: 'name', description: '商品名称（模糊查询）', required: false })
  @ApiQuery({ name: 'categoryId', description: '分类ID', required: false })
  @ApiQuery({ name: 'brandId', description: '品牌ID', required: false })
  @ApiQuery({ name: 'isShow', description: '是否上架(0:下架, 1:上架)', required: false })
  @ApiQuery({ name: 'isNew', description: '是否新品(0:否 1:是)', required: false })
  @ApiQuery({ name: 'isHot', description: '是否热门(0:否 1:是)', required: false })
  @ApiQuery({ name: 'recommend', description: '是否推荐(0:否 1:是)', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false })
  async findAll(@Query() params) {
    return await this.productsService.findAll(params);
  }

  // @Public()
  @Get('search')
  @ApiOperation({ summary: '商品搜索' })
  @ApiResponse({ status: 200, description: '搜索成功' })
  @ApiQuery({ name: 'keyword', description: '搜索关键词', required: false })
  @ApiQuery({ name: 'categoryId', description: '分类ID', required: false })
  @ApiQuery({ name: 'brandId', description: '品牌ID', required: false })
  @ApiQuery({ name: 'minPrice', description: '最低价', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', description: '最高价', required: false, type: Number })
  @ApiQuery({
    name: 'isShow',
    description: '是否上架(0:下架, 1:上架)',
    required: false,
    type: Number,
  })
  @ApiQuery({ name: 'isNew', description: '是否新品(0:否 1:是)', required: false, type: Number })
  @ApiQuery({ name: 'isHot', description: '是否热门(0:否 1:是)', required: false, type: Number })
  @ApiQuery({
    name: 'recommend',
    description: '是否推荐(0:否 1:是)',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'sortBy',
    description: '排序字段(price:价格, sales:销量 createdAt:新品)',
    required: false,
  })
  @ApiQuery({ name: 'sortOrder', description: '排序方式(ASC:升序, DESC:降序)', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, type: Number })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, type: Number })
  async search(@Query() query) {
    return await this.productsService.search(query);
  }

  // @Public()
  @Get('recommended')
  @ApiOperation({ summary: '获取推荐商品' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiQuery({ name: 'categoryId', description: '分类ID', required: false })
  @ApiQuery({ name: 'brandId', description: '品牌ID', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false })
  async getRecommendedProducts(@Query() params) {
    return await this.productsService.getRecommendedProducts(params);
  }

  // @Public()
  @Get(':id')
  @ApiOperation({ summary: '查询单个商品' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @ApiParam({ name: 'id', description: '商品ID' })
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  // @UseGuards(JwtAuthGuard)  // 生产环境应启用认证
  @Patch(':id')
  @ApiOperation({ summary: '更新商品' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @ApiParam({ name: 'id', description: '商品ID' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return await this.productsService.update(id, updateProductDto);
  }

  // @UseGuards(JwtAuthGuard)  // 生产环境应启用认证
  @Delete(':id')
  @ApiOperation({ summary: '删除商品' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @ApiParam({ name: 'id', description: '商品ID' })
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }

  // @UseGuards(JwtAuthGuard)  // 生产环境应启用认证
  @Delete('batch/delete')
  @ApiOperation({ summary: '批量删除商品' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async removeBatch(@Body('ids') ids: string[]) {
    return await this.productsService.removeBatch(ids);
  }

  // @UseGuards(JwtAuthGuard)  // 生产环境应启用认证
  @Patch(':id/status')
  @ApiOperation({ summary: '更新商品状态' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiQuery({ name: 'isShow', description: '是否上架(true/false)', required: true })
  async updateStatus(@Param('id') id: string, @Query('isShow') isShow: boolean) {
    return await this.productsService.updateStatus(id, isShow);
  }
}
