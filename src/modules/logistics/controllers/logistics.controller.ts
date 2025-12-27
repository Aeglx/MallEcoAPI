import { Controller, Post, Get, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { LogisticsService } from '../services/logistics.service';
import { CreateLogisticsDto } from '../dto/create-logistics.dto';
import { LabelOrderDTO } from '../dto/label-order.dto';
import { MallLogistics } from '../entities/logistics.entity';
import { Traces } from '../entities/traces.vo';

@ApiTags('物流管理')
@Controller('logistics')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Post()
  @ApiOperation({ summary: '创建物流信息' })
  @ApiBody({ type: CreateLogisticsDto })
  async createLogistics(@Body() createLogisticsDto: CreateLogisticsDto): Promise<MallLogistics> {
    return await this.logisticsService.createLogistics(createLogisticsDto);
  }

  @Get('query/:id')
  @ApiOperation({ summary: '查询物流信息' })
  @ApiParam({ name: 'id', description: '物流ID' })
  @ApiQuery({ name: 'expNo', description: '运单号', required: true })
  @ApiQuery({ name: 'phone', description: '手机号', required: false })
  async pollQuery(
    @Param('id') id: string,
    @Query('expNo') expNo: string,
    @Query('phone') phone?: string,
  ): Promise<Traces> {
    return await this.logisticsService.pollQuery(id, expNo, phone);
  }

  @Get('map-track/:id')
  @ApiOperation({ summary: '查询物流地图轨迹' })
  @ApiParam({ name: 'id', description: '物流ID' })
  @ApiQuery({ name: 'expNo', description: '运单号', required: true })
  @ApiQuery({ name: 'phone', description: '手机号', required: false })
  @ApiQuery({ name: 'from', description: '出发地', required: false })
  @ApiQuery({ name: 'to', description: '目的地', required: false })
  async pollMapTrack(
    @Param('id') id: string,
    @Query('expNo') expNo: string,
    @Query('phone') phone?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<Traces> {
    return await this.logisticsService.pollMapTrack(id, expNo, phone, from, to);
  }

  @Post('label-order/:id')
  @ApiOperation({ summary: '打印电子面单' })
  @ApiParam({ name: 'id', description: '物流ID' })
  @ApiBody({ type: LabelOrderDTO })
  async labelOrder(
    @Param('id') id: string,
    @Body() labelOrderDTO: LabelOrderDTO,
  ): Promise<Map<string, any>> {
    return await this.logisticsService.labelOrder(id, labelOrderDTO);
  }

  @Post('create-order/:id')
  @ApiOperation({ summary: '创建物流订单' })
  @ApiParam({ name: 'id', description: '物流ID' })
  async createOrder(@Param('id') id: string, @Body() orderDetailVO: any): Promise<string> {
    return await this.logisticsService.createOrder(id, orderDetailVO);
  }

  @Get()
  @ApiOperation({ summary: '获取所有物流信息' })
  async findAllLogistics(): Promise<MallLogistics[]> {
    return await this.logisticsService.findAllLogistics();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取物流信息' })
  @ApiParam({ name: 'id', description: '物流ID' })
  async findLogisticsById(@Param('id') id: string): Promise<MallLogistics> {
    return await this.logisticsService.findLogisticsById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新物流信息' })
  @ApiParam({ name: 'id', description: '物流ID' })
  async updateLogistics(
    @Param('id') id: string,
    @Body() updateLogisticsDto: any,
  ): Promise<MallLogistics> {
    return await this.logisticsService.updateLogistics(id, updateLogisticsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除物流信息' })
  @ApiParam({ name: 'id', description: '物流ID' })
  async deleteLogistics(@Param('id') id: string): Promise<void> {
    return await this.logisticsService.deleteLogistics(id);
  }
}
