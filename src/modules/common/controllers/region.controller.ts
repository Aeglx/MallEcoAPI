import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegionService } from '../services/region.service';

@ApiTags('地址管理')
@Controller('common/common/region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get('region')
  getRegion(@Query('cityCode') cityCode: string, @Query('townName') townName: string) {
    return { success: true, result: this.regionService.getRegion(cityCode, townName) };
  }

  @Get('name')
  getItemByLastName(@Query('lastName') lastName: string) {
    return { success: true, result: this.regionService.getItemByLastName(lastName) };
  }

  @Get('item/:id')
  getItem(@Param('id') id: string) {
    return { success: true, result: this.regionService.getItem(id) };
  }

  @Get('allCity')
  getAllCity() {
    return { success: true, result: this.regionService.getAllCity() };
  }
}