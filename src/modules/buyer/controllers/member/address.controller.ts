import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

@Controller('buyer/member/address')
export class MemberAddressController {
  
  @Get()
  findAll() {
    // 获取会员地址列表
    return { message: '获取会员地址列表' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // 获取指定地址详情
    return { message: `获取地址 ${id} 详情` };
  }

  @Post()
  create(@Body() createDto: any) {
    // 新增地址
    return { message: '创建新地址' };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    // 更新地址
    return { message: `更新地址 ${id}` };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // 删除地址
    return { message: `删除地址 ${id}` };
  }

  @Patch(':id/default')
  setDefault(@Param('id') id: string) {
    // 设为默认地址
    return { message: `设置地址 ${id} 为默认地址` };
  }
}