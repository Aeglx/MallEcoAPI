import { Controller, Post, Get, Put, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AfterSalesService } from '../services/after-sales.service';
import { CreateAfterSalesDto } from '../dto/create-after-sales.dto';
import { UpdateAfterSalesDto } from '../dto/update-after-sales.dto';
import { AfterSales, AfterSalesStatus } from '../entities/after-sales.entity';

@ApiTags('售后管理')
@Controller('after-sales')
export class AfterSalesController {
  constructor(private readonly afterSalesService: AfterSalesService) {}

  @Post()
  @ApiOperation({ summary: '创建售后服务申请' })
  @ApiBody({ type: CreateAfterSalesDto })
  async createAfterSales(@Body() createAfterSalesDto: CreateAfterSalesDto): Promise<AfterSales> {
    return await this.afterSalesService.createAfterSales(createAfterSalesDto);
  }

  @Put('review/:id')
  @ApiOperation({ summary: '审核售后服务申请' })
  @ApiParam({ name: 'id', description: '售后服务ID' })
  @ApiBody({ type: UpdateAfterSalesDto })
  async reviewAfterSales(
    @Param('id') id: number,
    @Body() updateAfterSalesDto: UpdateAfterSalesDto,
  ): Promise<AfterSales> {
    return await this.afterSalesService.reviewAfterSales(id, updateAfterSalesDto);
  }

  @Put('return-info/:id')
  @ApiOperation({ summary: '提交退货物流信息' })
  @ApiParam({ name: 'id', description: '售后服务ID' })
  @ApiBody({ type: UpdateAfterSalesDto })
  async submitReturnInfo(
    @Param('id') id: number,
    @Body() updateAfterSalesDto: UpdateAfterSalesDto,
  ): Promise<AfterSales> {
    return await this.afterSalesService.submitReturnInfo(id, updateAfterSalesDto);
  }

  @Put('complete/:id')
  @ApiOperation({ summary: '确认收货并完成售后服务' })
  @ApiParam({ name: 'id', description: '售后服务ID' })
  @ApiBody({ type: UpdateAfterSalesDto })
  async completeAfterSales(
    @Param('id') id: number,
    @Body() updateAfterSalesDto: UpdateAfterSalesDto,
  ): Promise<AfterSales> {
    return await this.afterSalesService.completeAfterSales(id, updateAfterSalesDto);
  }

  @Put('cancel/:id')
  @ApiOperation({ summary: '用户取消售后服务申请' })
  @ApiParam({ name: 'id', description: '售后服务ID' })
  @ApiQuery({ name: 'userId', description: '用户ID', required: true })
  async cancelAfterSales(
    @Param('id') id: number,
    @Query('userId') userId: string,
  ): Promise<AfterSales> {
    return await this.afterSalesService.cancelAfterSales(id, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取售后服务详情' })
  @ApiParam({ name: 'id', description: '售后服务ID' })
  async findAfterSalesById(@Param('id') id: number): Promise<AfterSales> {
    return await this.afterSalesService.findAfterSalesById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户的售后服务列表' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  async findAfterSalesByUserId(@Param('userId') userId: string): Promise<AfterSales[]> {
    return await this.afterSalesService.findAfterSalesByUserId(userId);
  }

  @Get()
  @ApiOperation({ summary: '获取所有售后服务列表' })
  async findAllAfterSales(): Promise<AfterSales[]> {
    return await this.afterSalesService.findAllAfterSales();
  }

  @Get('status/:status')
  @ApiOperation({ summary: '根据状态获取售后服务列表' })
  @ApiParam({ name: 'status', description: '售后服务状态', enum: AfterSalesStatus })
  async findAfterSalesByStatus(@Param('status') status: AfterSalesStatus): Promise<AfterSales[]> {
    return await this.afterSalesService.findAfterSalesByStatus(status);
  }
}
