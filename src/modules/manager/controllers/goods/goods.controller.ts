import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoodsService } from '../../services/goods/goods.service';

@ApiTags('商品')
@Controller('manager/goods')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}
  
  @Get()
  async findAll(@Query() query: any) {
    return await this.goodsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.goodsService.findOne(id);
  }

  @Post()
  async create(@Body() goodsData: any) {
    return await this.goodsService.create(goodsData);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() goodsData: any) {
    return await this.goodsService.update(id, goodsData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.goodsService.remove(id);
  }
}