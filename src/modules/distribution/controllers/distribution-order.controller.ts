import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { DistributionOrderService } from '../services/distribution-order.service';
import { DistributionService } from '../services/distribution.service';
import { DistributionOrderSearchParams } from '../dto/distribution-order-search.dto';
import { DistributionOrder } from '../entities/distribution-order.entity';
import { DistributionOrderStatusEnum } from '../enums/distribution-order-status.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('分销订单管理')
@Controller('distribution-order')
@UseGuards(JwtAuthGuard)
export class DistributionOrderController {
  constructor(
    private readonly distributionOrderService: DistributionOrderService,
    private readonly distributionService: DistributionService
  ) {}

  @ApiOperation({ summary: '获取分销员分页订单列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get('page')
  async getDistributionOrderPage(
    @Query() searchParams: DistributionOrderSearchParams,
    @Request() req
  ): Promise<{ 
    data: DistributionOrder[]; 
    total: number; 
    page: number; 
    pageSize: number; 
  }> {
    // 如果是分销员角色，只能查看自己的订单
    if (req.user.role === 'DISTRIBUTION') {
      const distribution = await this.distributionService.getDistributionByMemberId(req.user.id);
      searchParams.distributionId = distribution.id;
    }

    const { items, total } = await this.distributionOrderService.getDistributionOrderPage(searchParams);
    
    return {
      data: items,
      total,
      page: searchParams.page || 1,
      pageSize: searchParams.pageSize || 10
    };
  }

  @ApiOperation({ summary: '根据ID获取分销订单' })
  @ApiParam({ name: 'id', description: '分销订单ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: DistributionOrder })
  @Get(':id')
  async getDistributionOrderById(
    @Param('id') id: string
  ): Promise<{ data: DistributionOrder }> {
    const distributionOrder = await this.distributionOrderService.getDistributionOrderById(id);
    
    return { data: distributionOrder };
  }

  @ApiOperation({ summary: '根据分销员ID获取订单列表' })
  @ApiParam({ name: 'distributionId', description: '分销员ID' })
  @ApiResponse({ status: 200, description: '获取成功', isArray: true, type: DistributionOrder })
  @Get('distribution/:distributionId')
  async getOrdersByDistributionId(
    @Param('distributionId') distributionId: string
  ): Promise<{ data: DistributionOrder[] }> {
    const distributionOrders = await this.distributionOrderService.getOrdersByDistributionId(distributionId);
    
    return { data: distributionOrders };
  }

  @ApiOperation({ summary: '根据订单编号获取分销订单' })
  @ApiParam({ name: 'orderSn', description: '订单编号' })
  @ApiResponse({ status: 200, description: '获取成功', type: DistributionOrder })
  @Get('order/:orderSn')
  async getDistributionOrderByOrderSn(
    @Param('orderSn') orderSn: string
  ): Promise<{ data: DistributionOrder }> {
    const distributionOrder = await this.distributionOrderService.getDistributionOrderByOrderSn(orderSn);
    
    return { data: distributionOrder };
  }

  @ApiOperation({ summary: '更新分销订单状态' })
  @ApiParam({ name: 'id', description: '分销订单ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: DistributionOrder })
  @Put('status/:id')
  async updateDistributionOrderStatus(
    @Param('id') id: string,
    @Body() statusData: { 
      status: DistributionOrderStatusEnum;
    }
  ): Promise<{ data: DistributionOrder; message: string }> {
    const distributionOrder = await this.distributionOrderService.updateDistributionOrderStatus(
      id, 
      statusData.status
    );
    
    return {
      data: distributionOrder,
      message: '订单状态更新成功'
    };
  }

  @ApiOperation({ summary: '处理分销订单退款' })
  @ApiParam({ name: 'orderItemSn', description: '子订单编号' })
  @ApiResponse({ status: 200, description: '处理成功' })
  @Put('refund/:orderItemSn')
  async handleDistributionOrderRefund(
    @Param('orderItemSn') orderItemSn: string,
    @Body() refundData: { 
      refundAmount: number;
    }
  ): Promise<{ message: string }> {
    await this.distributionOrderService.handleDistributionOrderRefund(
      orderItemSn, 
      refundData.refundAmount
    );
    
    return { message: '退款处理成功' };
  }

  @ApiOperation({ summary: '获取分销订单统计信息' })
  @ApiQuery({ name: 'distributionId', description: '分销员ID', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get('statistics/overview')
  async getDistributionOrderStatistics(
    @Query('distributionId') distributionId?: string
  ): Promise<{ data: any }> {
    const statistics = await this.distributionOrderService.getDistributionOrderStatistics(distributionId);
    
    return { data: statistics };
  }
}