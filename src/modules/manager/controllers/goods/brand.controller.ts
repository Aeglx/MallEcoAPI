import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BrandService } from '../../services/goods/brand.service';

@Controller('manager/goods/brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}
  
  @Get()
  async findAll(@Query() query: any) {
    return await this.brandService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.brandService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: any) {
    return await this.brandService.create(createDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return await this.brandService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.brandService.remove(id);
  }

  @Post('batch')
  async batchOperation(@Body() batchDto: any) {
    return await this.brandService.batchOperation(batchDto);
  }
}