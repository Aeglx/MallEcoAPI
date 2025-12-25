import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MemberService } from './member.service';

@ApiTags('会员管理')
@Controller('buyer/member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  // 会员收藏相关API
  @Post('collection/add/:type/:id')
  async collectGoods(@Param('type') type: string, @Param('id') id: string) {
    return this.memberService.collectGoods(type, id);
  }

  @Post('storeCollection/add/:type/:id')
  async collectStore(@Param('type') type: string, @Param('id') id: string) {
    return this.memberService.collectStore(type, id);
  }

  @Delete('collection/delete/:type/:id')
  async cancelCollect(@Param('type') type: string, @Param('id') id: string) {
    return this.memberService.cancelCollect(type, id);
  }

  @Delete('storeCollection/delete/:type/:id')
  async cancelStoreCollect(@Param('type') type: string, @Param('id') id: string) {
    return this.memberService.cancelStoreCollect(type, id);
  }

  @Get('collection/isCollection/:type/:goodsId')
  async isCollection(@Param('type') type: string, @Param('goodsId') goodsId: string) {
    return this.memberService.isCollection(type, goodsId);
  }

  @Get('storeCollection/isCollection/:type/:goodsId')
  async isStoreCollection(@Param('type') type: string, @Param('goodsId') goodsId: string) {
    return this.memberService.isStoreCollection(type, goodsId);
  }

  @Get('collection/:type')
  async collectList(@Param('type') type: string, @Query() params: any) {
    return this.memberService.collectList(type, params);
  }

  @Get('storeCollection/:type')
  async storeCollectList(@Param('type') type: string, @Query() params: any) {
    return this.memberService.storeCollectList(type, params);
  }

  // 会员评价相关API
  @Get('evaluation/:goodsId/goodsEvaluation')
  async goodsComment(@Param('goodsId') goodsId: string, @Query() params: any) {
    return this.memberService.goodsComment(goodsId, params);
  }

  @Get('evaluation/:goodsId/evaluationNumber')
  async goodsCommentNum(@Param('goodsId') goodsId: string) {
    return this.memberService.goodsCommentNum(goodsId);
  }

  @Post('evaluation')
  async addEvaluation(@Body() params: any) {
    return this.memberService.addEvaluation(params);
  }

  @Get('evaluation')
  async evaluationList(@Query() params: any) {
    return this.memberService.evaluationList(params);
  }

  @Get('evaluation/get/:id')
  async evaluationDetail(@Param('id') id: string) {
    return this.memberService.evaluationDetail(id);
  }

  // 会员足迹相关API
  @Get('footprint')
  async tracksList(@Query() params: any) {
    return this.memberService.tracksList(params);
  }

  @Delete('footprint')
  async clearTracks() {
    return this.memberService.clearTracks();
  }

  @Delete('footprint/delByIds/:ids')
  async clearTracksById(@Param('ids') ids: string) {
    return this.memberService.clearTracksById(ids);
  }

  // 会员积分相关API
  @Get('memberPointsHistory/getMemberPointsHistoryVO')
  async memberPoint(@Query() params: any) {
    return this.memberService.memberPoint(params);
  }

  @Get('memberPointsHistory/getByPage')
  async memberPointHistory(@Query() params: any) {
    return this.memberService.memberPointHistory(params);
  }

  // 会员消息相关API
  @Get('message/member')
  async memberMsgList(@Query() params: any) {
    return this.memberService.memberMsgList(params);
  }

  @Put('message/member/:id')
  async readMemberMsg(@Param('id') id: string) {
    return this.memberService.readMemberMsg(id);
  }

  @Delete('message/member/:id')
  async delMemberMsg(@Param('id') id: string) {
    return this.memberService.delMemberMsg(id);
  }

  // 提现申请相关API
  @Get('withdrawApply')
  async getWithdrawApply(@Query() params: any) {
    return this.memberService.getWithdrawApply(params);
  }
}