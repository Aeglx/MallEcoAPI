import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PointsRecordService } from '../../services/points/points-record.service';

@ApiTags('积分商城-积分记录')
@Controller('manager/points/record')
export class PointsRecordController {
  constructor(private readonly pointsRecordService: PointsRecordService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.pointsRecordService.findAll(query);
  }

  @Get('member/:memberId')
  findByMemberId(@Param('memberId') memberId: string, @Query() query: any) {
    return this.pointsRecordService.findByMemberId(memberId, query);
  }

  @Post('adjust')
  adjustPoints(@Body() adjustData: any) {
    return this.pointsRecordService.adjustPoints(adjustData);
  }
}

