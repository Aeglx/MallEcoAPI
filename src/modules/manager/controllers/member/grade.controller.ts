import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('会员管理')
@Controller('manager/member/grade')
export class GradeController {
  @Get()
  findAll() {
    return { message: '获取会员等级列表' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { message: '获取会员等级详情', id };
  }

  @Post()
  create(@Body() gradeData: any) {
    return { message: '创建会员等级', gradeData };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() gradeData: any) {
    return { message: '更新会员等级', id, gradeData };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return { message: '删除会员等级', id };
  }
}
