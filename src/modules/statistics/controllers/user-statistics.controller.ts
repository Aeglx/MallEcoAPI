import { Controller, Get, Query } from '@nestjs/common';
import { UserStatisticsService } from '../services/user-statistics.service';
import { UserStatisticsQueryDto } from '../dto/user-statistics-query.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('用户统计')
@Controller('statistics/users')
export class UserStatisticsController {
  constructor(private readonly userStatisticsService: UserStatisticsService) {}

  @Get()
  @ApiOperation({ summary: '获取用户统计数据' })
  @ApiResponse({ status: 200, description: '获取用户统计数据成功' })
  getUserStatistics(@Query() queryDto: UserStatisticsQueryDto) {
    return this.userStatisticsService.getUserStatistics(queryDto);
  }

  @Get('growth')
  @ApiOperation({ summary: '获取用户增长数据' })
  @ApiResponse({ status: 200, description: '获取用户增长数据成功' })
  getUserGrowth(@Query() queryDto: UserStatisticsQueryDto) {
    return this.userStatisticsService.getUserGrowth(queryDto);
  }

  @Get('retention')
  @ApiOperation({ summary: '获取用户留存数据' })
  @ApiResponse({ status: 200, description: '获取用户留存数据成功' })
  getUserRetention(@Query() queryDto: UserStatisticsQueryDto) {
    return this.userStatisticsService.getUserRetention(queryDto);
  }

  @Get('behavior')
  @ApiOperation({ summary: '获取用户行为数据' })
  @ApiResponse({ status: 200, description: '获取用户行为数据成功' })
  getUserBehavior(@Query() queryDto: UserStatisticsQueryDto) {
    return this.userStatisticsService.getUserBehavior(queryDto);
  }

  @Get('report')
  @ApiOperation({ summary: '生成用户统计报告' })
  @ApiResponse({ status: 200, description: '生成用户统计报告成功' })
  generateUserReport(@Query() queryDto: UserStatisticsQueryDto) {
    return this.userStatisticsService.generateUserReport(queryDto);
  }
}
