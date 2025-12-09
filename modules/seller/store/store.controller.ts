import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { UpdateStoreDto } from './dto/store.dto';

@ApiTags('Seller - Store')
@Controller('seller/store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get(':id')
  @ApiOperation({ summary: '获取店铺详情' })
  @ApiParam({ name: 'id', description: '店铺ID', example: '1' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '店铺不存在' })
  async getStoreDetail(@Param('id') id: string) {
    return await this.storeService.getStoreDetail(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新店铺信息' })
  @ApiParam({ name: 'id', description: '店铺ID', example: '1' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '店铺不存在' })
  async updateStore(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return await this.storeService.updateStore(id, updateStoreDto);
  }

  @Post(':id/upload-license')
  @ApiOperation({ summary: '上传店铺营业执照' })
  @ApiParam({ name: 'id', description: '店铺ID', example: '1' })
  @ApiResponse({ status: 200, description: '上传成功' })
  @ApiResponse({ status: 404, description: '店铺不存在' })
  async uploadBusinessLicense(@Param('id') id: string, @Body('licenseUrl') licenseUrl: string) {
    return await this.storeService.uploadBusinessLicense(id, licenseUrl);
  }

  @Post(':id/apply-audit')
  @ApiOperation({ summary: '申请店铺审核' })
  @ApiParam({ name: 'id', description: '店铺ID', example: '1' })
  @ApiResponse({ status: 200, description: '申请成功' })
  @ApiResponse({ status: 404, description: '店铺不存在' })
  async applyAudit(@Param('id') id: string) {
    return await this.storeService.applyAudit(id);
  }
}
