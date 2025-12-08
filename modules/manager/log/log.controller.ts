import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { LogService } from './log.service';
import { CreateLogDto } from './dto/create-log.dto';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard';

@Controller('manager/log')
@UseGuards(JwtAuthGuard)
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Post()
  create(@Body() createLogDto: CreateLogDto) {
    return this.logService.create(createLogDto);
  }

  @Post('batch')
  createBatch(@Body() logs: CreateLogDto[]) {
    return this.logService.createBatch(logs);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.logService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logService.remove(id);
  }

  @Delete('date-range')
  removeByDateRange(@Query('startTime') startTime: Date, @Query('endTime') endTime: Date) {
    return this.logService.removeByDateRange(startTime, endTime);
  }

  @Delete('old/:days')
  removeOldLogs(@Param('days') days: number) {
    return this.logService.removeOldLogs(days);
  }

  @Get('statistics')
  getStatistics(@Query('startTime') startTime: Date, @Query('endTime') endTime: Date) {
    return this.logService.getLogStatistics(startTime, endTime);
  }

  @Get('statistics/user/:operatorId')
  getUserOperationStats(@Param('operatorId') operatorId: string, @Query('days') days: number = 30) {
    return this.logService.getUserOperationStats(operatorId, days);
  }
}
