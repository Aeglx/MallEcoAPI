import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MemberService } from '../../services/member/member.service';

@ApiTags('会员管理')
@Controller('manager/member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.memberService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memberService.findOne(id);
  }

  @Post()
  create(@Body() memberData: any) {
    return this.memberService.create(memberData);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() memberData: any) {
    return this.memberService.update(id, memberData);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() statusData: any) {
    return this.memberService.updateStatus(id, statusData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.memberService.remove(id);
  }

  @Delete('batch')
  batchRemove(@Body() body: { ids: string[] }) {
    return this.memberService.batchRemove(body.ids);
  }

  @Get('recycle')
  getRecycleList(@Query() query: any) {
    return this.memberService.getRecycleList(query);
  }

  @Post('recycle/:id/restore')
  restoreMember(@Param('id') id: string) {
    return this.memberService.restoreMember(id);
  }

  @Delete('recycle/:id')
  permanentDelete(@Param('id') id: string) {
    return this.memberService.permanentDelete(id);
  }
}
