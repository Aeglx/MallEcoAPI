import { Controller, Get, Query, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RegionService } from '../services/region.service';

@ApiTags('地址管理')
@Controller('common/common/region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get('region')
  @ApiOperation({ summary: '获取地区信息' })
  async getRegion(@Query('cityCode') cityCode: string, @Query('townName') townName: string) {
    return await this.regionService.getRegion(cityCode, townName);
  }

  @Get('name')
  @ApiOperation({ summary: '根据名称获取地区ID' })
  async getItemByLastName(@Query('lastName') lastName: string) {
    return await this.regionService.getItemByLastName(lastName);
  }

  @Get('item/:id')
  @ApiOperation({ summary: '根据父级ID获取子地区列表' })
  async getItem(@Param('id') id: string) {
    return await this.regionService.getItem(id);
  }

  @Get('allCity')
  @ApiOperation({ summary: '获取所有省-市数据' })
  async getAllCity() {
    return await this.regionService.getAllCity();
  }

  @Get('tree')
  @ApiOperation({ summary: '获取省市区三级树形数据' })
  async getRegionTree(@Query('parentId') parentId?: string) {
    return await this.regionService.getRegionTree(parentId || '0');
  }

  @Get('level/:level')
  @ApiOperation({ summary: '根据级别获取地区列表' })
  async getByLevel(@Param('level') level: string) {
    return await this.regionService.getByLevel(level);
  }

  @Get('search')
  @ApiOperation({ summary: '搜索地区' })
  async search(@Query('keyword') keyword: string) {
    return await this.regionService.search(keyword);
  }

  @Post('init')
  @ApiOperation({ summary: '初始化地区数据' })
  async initRegions() {
    return await this.regionService.initRegions();
  }
}
