import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('会员管理')
@Controller('manager/member')
export class MemberController {
  @Get()
  findAll(@Query() query: any) {
    return { message: '获取会员列表', query };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { message: '获取会员详情', id };
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() statusData: any) {
    return { message: '更新会员状态', id, statusData };
  }
}
