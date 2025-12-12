import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { DistributionGoodsService } from '../services/distribution-goods.service';
import { DistributionGoodsSearchParams } from '../dto/distribution-goods-search.dto';
import { DistributionGoods } from '../entities/distribution-goods.entity';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';

@ApiTags('分销商品管理')
@Controller('distribution-goods')
@UseGuards(JwtAuthGuard)
export class DistributionGoodsController {
  constructor(private readonly distributionGoodsService: DistributionGoodsService) {}

  @ApiOperation({ summary: '创建分销商品' })
  @ApiResponse({ status: 200, description: '创建成功', type: DistributionGoods })
  @Post()
  async createDistributionGoods(
    @Body() goodsData: Partial<DistributionGoods>,
    @Request() req
  ): Promise<{ data: DistributionGoods; message: string }> {
    goodsData.createBy = req.user.id;
    
    const distributionGoods = await this.distributionGoodsService.createDistributionGoods(goodsData);
    
    return {
      data: distributionGoods,
      message: '分销商品创建成功'
    };
  }

  @ApiOperation({ summary: '批量创建分销商品' })
  @ApiResponse({ status: 200, description: '创建成功', isArray: true, type: DistributionGoods })
  @Post('batch')
  async createBatchDistributionGoods(
    @Body() goodsList: Partial<DistributionGoods>[],
    @Request() req
  ): Promise<{ data: DistributionGoods[]; message: string }> {
    // 设置创建者
    goodsList.forEach(goods => {
      goods.createBy = req.user.id;
    });
    
    const distributionGoods = await this.distributionGoodsService.createBatchDistributionGoods(goodsList);
    
    return {
      data: distributionGoods,
      message: '批量创建分销商品成功'
    };
  }

  @ApiOperation({ summary: '获取分销商品分页列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get('list')
  async getDistributionGoodsList(
    @Query() searchParams: DistributionGoodsSearchParams
  ): Promise<{ 
    data: DistributionGoods[]; 
    total: number; 
    page: number; 
    pageSize: number; 
  }> {
    const { items, total } = await this.distributionGoodsService.getDistributionGoodsList(searchParams);
    
    return {
      data: items,
      total,
      page: searchParams.page || 1,
      pageSize: searchParams.pageSize || 10
    };
  }

  @ApiOperation({ summary: '根据ID获取分销商品' })
  @ApiParam({ name: 'id', description: '分销商品ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: DistributionGoods })
  @Get(':id')
  async getDistributionGoodsById(
    @Param('id') id: string
  ): Promise<{ data: DistributionGoods }> {
    const distributionGoods = await this.distributionGoodsService.getDistributionGoodsById(id);
    
    return { data: distributionGoods };
  }

  @ApiOperation({ summary: '根据SKU获取分销商品' })
  @ApiParam({ name: 'skuId', description: 'SKU ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: DistributionGoods })
  @Get('sku/:skuId')
  async getDistributionGoodsBySkuId(
    @Param('skuId') skuId: string
  ): Promise<{ data: DistributionGoods }> {
    const distributionGoods = await this.distributionGoodsService.getDistributionGoodsBySkuId(skuId);
    
    return { data: distributionGoods };
  }

  @ApiOperation({ summary: '获取店铺的分销商品列表' })
  @ApiParam({ name: 'storeId', description: '店铺ID' })
  @ApiResponse({ status: 200, description: '获取成功', isArray: true, type: DistributionGoods })
  @Get('store/:storeId')
  async getDistributionGoodsByStoreId(
    @Param('storeId') storeId: string
  ): Promise<{ data: DistributionGoods[] }> {
    const distributionGoods = await this.distributionGoodsService.getDistributionGoodsByStoreId(storeId);
    
    return { data: distributionGoods };
  }

  @ApiOperation({ summary: '根据商品ID获取分销商品列表' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  @ApiResponse({ status: 200, description: '获取成功', isArray: true, type: DistributionGoods })
  @Get('goods/:goodsId')
  async getDistributionGoodsByGoodsId(
    @Param('goodsId') goodsId: string
  ): Promise<{ data: DistributionGoods[] }> {
    const distributionGoods = await this.distributionGoodsService.getDistributionGoodsByGoodsId(goodsId);
    
    return { data: distributionGoods };
  }

  @ApiOperation({ summary: '检查SKU是否为分销商品' })
  @ApiParam({ name: 'skuId', description: 'SKU ID' })
  @ApiResponse({ status: 200, description: '检查结果' })
  @Get('check/:skuId')
  async checkIsDistributionGoods(
    @Param('skuId') skuId: string
  ): Promise<{ data: { isDistribution: boolean } }> {
    const isDistribution = await this.distributionGoodsService.isDistributionGoods(skuId);
    
    return { data: { isDistribution } };
  }

  @ApiOperation({ summary: '更新分销商品' })
  @ApiParam({ name: 'id', description: '分销商品ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: DistributionGoods })
  @Put(':id')
  async updateDistributionGoods(
    @Param('id') id: string,
    @Body() updateData: Partial<DistributionGoods>
  ): Promise<{ data: DistributionGoods; message: string }> {
    const distributionGoods = await this.distributionGoodsService.updateDistributionGoods(id, updateData);
    
    return {
      data: distributionGoods,
      message: '分销商品更新成功'
    };
  }

  @ApiOperation({ summary: '删除分销商品' })
  @ApiParam({ name: 'id', description: '分销商品ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @Delete(':id')
  async deleteDistributionGoods(
    @Param('id') id: string
  ): Promise<{ message: string }> {
    await this.distributionGoodsService.deleteDistributionGoods(id);
    
    return { message: '分销商品删除成功' };
  }

  @ApiOperation({ summary: '获取分销商品统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get('statistics/overview')
  async getDistributionGoodsStatistics(): Promise<{ data: any }> {
    const statistics = await this.distributionGoodsService.getDistributionGoodsStatistics();
    return { data: statistics };
  }
}
