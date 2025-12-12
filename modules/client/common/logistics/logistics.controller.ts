import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { CreateLogisticsDto } from './dto/create-logistics.dto';
import { UpdateLogisticsDto } from './dto/update-logistics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LogisticsStatus } from './entities/logistics.entity';

@Controller('logistics')
@UseGuards(JwtAuthGuard)
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Post()
  create(@Body() createLogisticsDto: CreateLogisticsDto, @Req() req) {
    const operatorInfo = { id: req.user.id, name: req.user.username };
    return this.logisticsService.create(createLogisticsDto, operatorInfo);
  }

  @Get()
  findAll() {
    return this.logisticsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logisticsService.findOne(id);
  }

  @Get('order/:orderId')
  findByOrderId(@Param('orderId') orderId: string) {
    return this.logisticsService.findByOrderId(orderId);
  }

  @Get('no/:logisticsNo')
  findByLogisticsNo(@Param('logisticsNo') logisticsNo: string) {
    return this.logisticsService.findByLogisticsNo(logisticsNo);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLogisticsDto: UpdateLogisticsDto, @Req() req) {
    const operatorInfo = { id: req.user.id, name: req.user.username };
    return this.logisticsService.update(id, updateLogisticsDto, operatorInfo);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const operatorInfo = { id: req.user.id, name: req.user.username };
    return this.logisticsService.remove(id, operatorInfo);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('logisticsStatus') logisticsStatus: LogisticsStatus,
    @Body('trackingInfo') trackingInfo: string,
    @Req() req,
  ) {
    const operatorInfo = { id: req.user.id, name: req.user.username };
    return this.logisticsService.updateStatus(id, logisticsStatus, trackingInfo, operatorInfo);
  }

  @Patch('simulate/:logisticsNo')
  simulateTracking(
    @Param('logisticsNo') logisticsNo: string,
    @Body('logisticsStatus') logisticsStatus: LogisticsStatus,
    @Body('trackingInfo') trackingInfo: string,
  ) {
    return this.logisticsService.simulateTracking(logisticsNo, logisticsStatus, trackingInfo);
  }
}
