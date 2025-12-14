import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { DistributionService } from './distribution.service';
import { Distributor } from './entities/distributor.entity';
import { CommissionRecord } from './entities/commission-record.entity';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';

@ApiTags('分销管理')
@Controller('distribution')
export class DistributionController {
  constructor(private readonly distributionService: DistributionService) {}

  // 分销商相关接口
  @Post('distributors')
  @ApiOperation({ summary: '创建分销商' })
  @ApiBody({ type: CreateDistributorDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: '创建成功', type: Distributor })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '参数错误' })
  async createDistributor(@Body() createDistributorDto: CreateDistributorDto): Promise<{ success: boolean; data: Distributor; message: string }> {
    const distributor = await this.distributionService.createDistributor(createDistributorDto);
    return {
      success: true,
      data: distributor,
      message: '创建分销商成功',
    };
  }

  @Get('distributors')
  @ApiOperation({ summary: '获取分销商列表' })
  @ApiQuery({ name: 'page', description: '页码', example: 1, required: false, type: Number })
  @ApiQuery({ name: 'pageSize', description: '每页数量', example: 10, required: false, type: Number })
  @ApiQuery({ name: 'status', description: '状态：0-待审核，1-已通过，2-已拒绝，3-已冻结', example: 1, required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: '查询成功' })
  async getDistributors(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('status') status?: number
  ): Promise<{ success: boolean; data: { items: Distributor[]; total: number }; message: string }> {
    const result = await this.distributionService.getDistributors(page, pageSize, status);
    return {
      success: true,
      data: result,
      message: '获取分销商列表成功',
    };
  }

  @Get('distributors/:id')
  @ApiOperation({ summary: '根据ID获取分销商' })
  @ApiParam({ name: 'id', description: '分销商ID', example: '1234567890abcdef12345678', required: true })
  @ApiResponse({ status: HttpStatus.OK, description: '查询成功', type: Distributor })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '分销商不存在' })
  async getDistributorById(@Param('id') id: string): Promise<{ success: boolean; data: Distributor; message: string }> {
    const distributor = await this.distributionService.getDistributorById(id);
    return {
      success: true,
      data: distributor,
      message: '获取分销商详情成功',
    };
  }

  @Get('distributors/user/:userId')
  @ApiOperation({ summary: '根据用户ID获取分销商' })
  @ApiParam({ name: 'userId', description: '用户ID', example: '1234567890abcdef12345678', required: true })
  @ApiResponse({ status: HttpStatus.OK, description: '查询成功', type: Distributor })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '分销商不存在' })
  async getDistributorByUserId(@Param('userId') userId: string): Promise<{ success: boolean; data: Distributor; message: string }> {
    const distributor = await this.distributionService.getDistributorByUserId(userId);
    return {
      success: true,
      data: distributor,
      message: '根据用户ID获取分销商成功',
    };
  }

  @Put('distributors/:id')
  @ApiOperation({ summary: '更新分销商' })
  @ApiParam({ name: 'id', description: '分销商ID', example: '1234567890abcdef12345678', required: true })
  @ApiBody({ type: UpdateDistributorDto })
  @ApiResponse({ status: HttpStatus.OK, description: '更新成功', type: Distributor })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '分销商不存在' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '参数错误' })
  async updateDistributor(
    @Param('id') id: string,
    @Body() updateDistributorDto: UpdateDistributorDto
  ): Promise<{ success: boolean; data: Distributor; message: string }> {
    const updatedDistributor = await this.distributionService.updateDistributor(id, updateDistributorDto);
    return {
      success: true,
      data: updatedDistributor,
      message: '更新分销商成功',
    };
  }

  @Delete('distributors/:id')
  @ApiOperation({ summary: '删除分销商' })
  @ApiParam({ name: 'id', description: '分销商ID', example: '1234567890abcdef12345678', required: true })
  @ApiResponse({ status: HttpStatus.OK, description: '删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '分销商不存在' })
  async deleteDistributor(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.distributionService.deleteDistributor(id);
    return {
      success: true,
      message: '删除分销商成功',
    };
  }

  // 佣金记录相关接口
  @Get('commissions')
  @ApiOperation({ summary: '获取佣金记录列表' })
  @ApiQuery({ name: 'distributorId', description: '分销商ID', example: '1234567890abcdef12345678', required: false })
  @ApiQuery({ name: 'status', description: '状态：0-待结算，1-已结算，2-已取消', example: 1, required: false, type: Number })
  @ApiQuery({ name: 'page', description: '页码', example: 1, required: false, type: Number })
  @ApiQuery({ name: 'pageSize', description: '每页数量', example: 10, required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: '查询成功' })
  async getCommissionRecords(
    @Query('distributorId') distributorId?: string,
    @Query('status') status?: number,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ): Promise<{ success: boolean; data: { items: CommissionRecord[]; total: number }; message: string }> {
    const result = await this.distributionService.getCommissionRecords(distributorId, status, page, pageSize);
    return {
      success: true,
      data: result,
      message: '获取佣金记录列表成功',
    };
  }

  @Get('commissions/:id')
  @ApiOperation({ summary: '获取佣金记录详情' })
  @ApiParam({ name: 'id', description: '佣金记录ID', example: '1234567890abcdef12345678', required: true })
  @ApiResponse({ status: HttpStatus.OK, description: '查询成功', type: CommissionRecord })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '佣金记录不存在' })
  async getCommissionRecordById(@Param('id') id: string): Promise<{ success: boolean; data: CommissionRecord; message: string }> {
    const record = await this.distributionService.getCommissionRecordById(id);
    return {
      success: true,
      data: record,
      message: '获取佣金记录详情成功',
    };
  }
}
