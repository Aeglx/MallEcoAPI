import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('管理端-数据统计')
@Controller('manager/statistics')
export class ManagerStatisticsController {
  // ========== 首页统计相关接口 ==========

  @Get('index')
  @ApiOperation({ summary: '获取首页统计数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getIndexStatistics(@Query() query: any) {
    // 返回首页统计数据
    return {
      success: true,
      result: {
        goodsNum: 0,
        memberNum: 0,
        orderNum: 0,
        shopNum: 0,
        todayOrderNum: 0,
        todayMemberNum: 0,
        todayGoodsNum: 0,
        todayShopNum: 0,
      },
    };
  }

  @Get('index/goodsStatistics')
  @ApiOperation({ summary: '获取首页商品统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getGoodsStatistics(@Query('searchType') searchType?: string) {
    // 返回商品统计数据（Top10商品）
    return {
      success: true,
      result: [],
    };
  }

  @Get('index/storeStatistics')
  @ApiOperation({ summary: '获取首页店铺统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getStoreStatistics(@Query('searchType') searchType?: string) {
    // 返回店铺统计数据（Top10店铺）
    return {
      success: true,
      result: [],
    };
  }

  @Get('index/notice')
  @ApiOperation({ summary: '获取首页通知信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getNotice() {
    // 返回通知信息
    return {
      success: true,
      result: {
        message: '',
        count: 0,
      },
    };
  }

  // ========== 会员统计相关接口 ==========

  @Get('member')
  @ApiOperation({ summary: '获取会员统计数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getMemberStatistics(@Query('searchType') searchType?: string) {
    // 返回会员统计数据（图表数据数组）
    return {
      success: true,
      result: [
        { date: '2024-01-01', uvNum: 0, pvNum: 0 },
        { date: '2024-01-02', uvNum: 0, pvNum: 0 },
        { date: '2024-01-03', uvNum: 0, pvNum: 0 },
        { date: '2024-01-04', uvNum: 0, pvNum: 0 },
        { date: '2024-01-05', uvNum: 0, pvNum: 0 },
        { date: '2024-01-06', uvNum: 0, pvNum: 0 },
        { date: '2024-01-07', uvNum: 0, pvNum: 0 },
      ],
    };
  }

  @Get('member/history')
  @ApiOperation({ summary: '获取会员历史统计数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getMemberHistory() {
    // 返回会员历史统计数据（图表数据数组）
    return {
      success: true,
      result: [
        { date: '01-01', num: 0, lastNum: 0 },
        { date: '01-02', num: 0, lastNum: 0 },
        { date: '01-03', num: 0, lastNum: 0 },
        { date: '01-04', num: 0, lastNum: 0 },
        { date: '01-05', num: 0, lastNum: 0 },
        { date: '01-06', num: 0, lastNum: 0 },
        { date: '01-07', num: 0, lastNum: 0 },
      ],
    };
  }

  // ========== 订单统计相关接口 ==========

  @Get('order')
  @ApiOperation({ summary: '获取订单统计数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getOrderStatistics(
    @Query('searchType') searchType?: string,
    @Query('year') year?: string,
    @Query('shopId') shopId?: string,
    @Query('memberId') memberId?: string,
  ) {
    // 返回订单统计数据（图表数据数组）
    return {
      success: true,
      result: [
        { createTime: '2024-01-01', price: 0 },
        { createTime: '2024-01-02', price: 0 },
        { createTime: '2024-01-03', price: 0 },
        { createTime: '2024-01-04', price: 0 },
        { createTime: '2024-01-05', price: 0 },
        { createTime: '2024-01-06', price: 0 },
        { createTime: '2024-01-07', price: 0 },
      ],
    };
  }
}
