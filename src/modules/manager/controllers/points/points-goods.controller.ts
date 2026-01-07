import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PointsGoodsService } from '../../services/points/points-goods.service';

@ApiTags('积分商城-商品管理')
@Controller('manager/points/goods')
export class PointsGoodsController {
  constructor(private readonly pointsGoodsService: PointsGoodsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.pointsGoodsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pointsGoodsService.findOne(id);
  }

  @Post()
  create(@Body() goodsData: any) {
    return this.pointsGoodsService.create(goodsData);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() goodsData: any) {
    return this.pointsGoodsService.update(id, goodsData);
  }

  @Patch(':id/stock')
  updateStock(@Param('id') id: string, @Body() body: { stock: number }) {
    return this.pointsGoodsService.updateStock(id, body.stock);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pointsGoodsService.remove(id);
  }

  @Delete('batch')
  batchRemove(@Body() body: { ids: string[] }) {
    return this.pointsGoodsService.batchRemove(body.ids);
  }
}
