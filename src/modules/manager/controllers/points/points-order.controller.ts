import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PointsOrderService } from '../../services/points/points-order.service';

@ApiTags('积分商城-订单管理')
@Controller('manager/points/order')
export class PointsOrderController {
  constructor(private readonly pointsOrderService: PointsOrderService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.pointsOrderService.findAll(query);
  }

  @Get('statistics')
  getStatistics(@Query() query: any) {
    return this.pointsOrderService.getStatistics(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pointsOrderService.findOne(id);
  }

  @Post()
  create(@Body() orderData: any) {
    return this.pointsOrderService.create(orderData);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() statusData: any) {
    return this.pointsOrderService.updateStatus(id, statusData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pointsOrderService.remove(id);
  }
}

