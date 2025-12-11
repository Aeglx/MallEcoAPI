import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AfterSaleService } from '../services/aftersale.service';
import { AfterSaleEntity } from '../entities/aftersale.entity';

@ApiTags('售后管理')
@Controller('aftersale')
export class AfterSaleController {
  constructor(private readonly afterSaleService: AfterSaleService) {}

  @Post()
  @ApiOperation({ summary: '创建售后申请' })
  @ApiResponse({ status: 201, description: '售后申请创建成功', type: AfterSaleEntity })
  async createAfterSale(@Body() data: {
    orderSn: string;
    orderItemId: string;
    afterSaleType: string; // RETURN:退货, REFUND:退款, EXCHANGE:换货
    afterSaleReason: string;
    afterSaleAmount?: number;
    returnQuantity?: number;
    afterSaleDescription?: string;
    proofImages?: string[];
    memberId: string;
  }) {
    return await this.afterSaleService.createAfterSale(data);
  }

  @Get()
  @ApiOperation({ summary: '获取售后申请列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'status', required: false, description: '售后状态' })
  @ApiQuery({ name: 'afterSaleType', required: false, description: '售后类型' })
  @ApiQuery({ name: 'memberId', required: false, description: '会员ID' })
  @ApiQuery({ name: 'storeId', required: false, description: '店铺ID' })
  async getAfterSaleList(@Query() params: {
    page?: number;
    pageSize?: number;
    status?: string;
    afterSaleType?: string;
    memberId?: string;
    storeId?: string;
  }) {
    return await this.afterSaleService.getAfterSaleList(params);
  }

  @Get(':afterSaleSn')
  @ApiOperation({ summary: '获取售后申请详情' })
  @ApiParam({ name: 'afterSaleSn', description: '售后单号' })
  @ApiResponse({ status: 200, description: '获取成功', type: AfterSaleEntity })
  async getAfterSaleDetail(@Param('afterSaleSn') afterSaleSn: string) {
    return await this.afterSaleService.getAfterSaleDetail(afterSaleSn);
  }

  @Put(':afterSaleSn')
  @ApiOperation({ summary: '更新售后申请' })
  @ApiParam({ name: 'afterSaleSn', description: '售后单号' })
  @ApiResponse({ status: 200, description: '更新成功', type: AfterSaleEntity })
  async updateAfterSale(
    @Param('afterSaleSn') afterSaleSn: string,
    @Body() updateData: Partial<AfterSaleEntity>
  ) {
    return await this.afterSaleService.updateAfterSale(afterSaleSn, updateData);
  }

  @Post(':afterSaleSn/cancel')
  @ApiOperation({ summary: '取消售后申请' })
  @ApiParam({ name: 'afterSaleSn', description: '售后单号' })
  @ApiResponse({ status: 200, description: '取消成功' })
  async cancelAfterSale(
    @Param('afterSaleSn') afterSaleSn: string,
    @Body() data: { cancelReason: string; memberId: string }
  ) {
    return await this.afterSaleService.cancelAfterSale(afterSaleSn, data);
  }

  @Post(':afterSaleSn/approve')
  @ApiOperation({ summary: '审核通过售后申请' })
  @ApiParam({ name: 'afterSaleSn', description: '售后单号' })
  @ApiResponse({ status: 200, description: '审核通过' })
  async approveAfterSale(
    @Param('afterSaleSn') afterSaleSn: string,
    @Body() data: {
      approveRemark?: string;
      operatorId: string;
      refundAmount?: number;
    }
  ) {
    return await this.afterSaleService.approveAfterSale(afterSaleSn, data);
  }

  @Post(':afterSaleSn/reject')
  @ApiOperation({ summary: '拒绝售后申请' })
  @ApiParam({ name: 'afterSaleSn', description: '售后单号' })
  @ApiResponse({ status: 200, description: '拒绝成功' })
  async rejectAfterSale(
    @Param('afterSaleSn') afterSaleSn: string,
    @Body() data: {
      rejectReason: string;
      operatorId: string;
    }
  ) {
    return await this.afterSaleService.rejectAfterSale(afterSaleSn, data);
  }

  @Post(':afterSaleSn/return')
  @ApiOperation({ summary: '确认退货' })
  @ApiParam({ name: 'afterSaleSn', description: '售后单号' })
  @ApiResponse({ status: 200, description: '退货确认成功' })
  async confirmReturn(
    @Param('afterSaleSn') afterSaleSn: string,
    @Body() data: {
      logisticsCompany: string;
      logisticsNumber: string;
      returnTime: string;
      operatorId: string;
    }
  ) {
    return await this.afterSaleService.confirmReturn(afterSaleSn, data);
  }

  @Post(':afterSaleSn/receive')
  @ApiOperation({ summary: '确认收到退货' })
  @ApiParam({ name: 'afterSaleSn', description: '售后单号' })
  @ApiResponse({ status: 200, description: '收货确认成功' })
  async confirmReceive(
    @Param('afterSaleSn') afterSaleSn: string,
    @Body() data: {
      receiveRemark?: string;
      operatorId: string;
    }
  ) {
    return await this.afterSaleService.confirmReceive(afterSaleSn, data);
  }

  @Post(':afterSaleSn/refund')
  @ApiOperation({ summary: '执行退款' })
  @ApiParam({ name: 'afterSaleSn', description: '售后单号' })
  @ApiResponse({ status: 200, description: '退款执行成功' })
  async executeRefund(
    @Param('afterSaleSn') afterSaleSn: string,
    @Body() data: {
      refundAmount: number;
      refundMethod: string;
      refundRemark?: string;
      operatorId: string;
    }
  ) {
    return await this.afterSaleService.executeRefund(afterSaleSn, data);
  }

  @Post(':afterSaleSn/exchange')
  @ApiOperation({ summary: '执行换货' })
  @ApiParam({ name: 'afterSaleSn', description: '售后单号' })
  @ApiResponse({ status: 200, description: '换货执行成功' })
  async executeExchange(
    @Param('afterSaleSn') afterSaleSn: string,
    @Body() data: {
      exchangeGoodsId: string;
      exchangeQuantity: number;
      logisticsCompany: string;
      logisticsNumber: string;
      operatorId: string;
    }
  ) {
    return await this.afterSaleService.executeExchange(afterSaleSn, data);
  }

  @Post(':afterSaleSn/complete')
  @ApiOperation({ summary: '完成售后' })
  @ApiParam({ name: 'afterSaleSn', description: '售后单号' })
  @ApiResponse({ status: 200, description: '售后完成' })
  async completeAfterSale(
    @Param('afterSaleSn') afterSaleSn: string,
    @Body() data: {
      completeRemark?: string;
      operatorId: string;
    }
  ) {
    return await this.afterSaleService.completeAfterSale(afterSaleSn, data);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: '获取会员售后列表' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'status', required: false, description: '售后状态' })
  async getMemberAfterSales(
    @Param('memberId') memberId: string,
    @Query() params: {
      page?: number;
      pageSize?: number;
      status?: string;
    }
  ) {
    return await this.afterSaleService.getMemberAfterSales(memberId, params);
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: '获取店铺售后列表' })
  @ApiParam({ name: 'storeId', description: '店铺ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'status', required: false, description: '售后状态' })
  async getStoreAfterSales(
    @Param('storeId') storeId: string,
    @Query() params: {
      page?: number;
      pageSize?: number;
      status?: string;
    }
  ) {
    return await this.afterSaleService.getStoreAfterSales(storeId, params);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取售后统计' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'storeId', required: false, description: '店铺ID' })
  async getAfterSaleStatistics(@Query() params: {
    startDate?: string;
    endDate?: string;
    storeId?: string;
  }) {
    return await this.afterSaleService.getAfterSaleStatistics(params);
  }

  @Post(':afterSaleSn/upload/proof')
  @ApiOperation({ summary: '上传售后凭证' })
  @ApiParam({ name: 'afterSaleSn', description: '售后单号' })
  @ApiResponse({ status: 200, description: '凭证上传成功' })
  async uploadProofImages(
    @Param('afterSaleSn') afterSaleSn: string,
    @Body() data: { proofImages: string[] }
  ) {
    return await this.afterSaleService.uploadProofImages(afterSaleSn, data.proofImages);
  }

  @Post(':afterSaleSn/communication')
  @ApiOperation({ summary: '添加售后沟通记录' })
  @ApiParam({ name: 'afterSaleSn', description: '售后单号' })
  @ApiResponse({ status: 200, description: '沟通记录添加成功' })
  async addCommunication(
    @Param('afterSaleSn') afterSaleSn: string,
    @Body() data: {
      content: string;
      operatorId: string;
      operatorType: string; // MEMBER:会员, STORE:店铺, PLATFORM:平台
      images?: string[];
    }
  ) {
    return await this.afterSaleService.addCommunication(afterSaleSn, data);
  }

  @Get(':afterSaleSn/communications')
  @ApiOperation({ summary: '获取售后沟通记录' })
  @ApiParam({ name: 'afterSaleSn', description: '售后单号' })
  async getCommunications(@Param('afterSaleSn') afterSaleSn: string) {
    return await this.afterSaleService.getCommunications(afterSaleSn);
  }
}