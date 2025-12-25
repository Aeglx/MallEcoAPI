import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommonService } from './common.service';

@ApiTags('通用')
@Controller('common/common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  // 通过id获取子地区
  @Get('region/item/:id')
  async getChildRegion(@Param('id') id: string) {
    return this.commonService.getChildRegion(id);
  }

  // 点地图获取地址信息
  @Get('region/region')
  async getRegion(@Query() params: any) {
    return this.commonService.getRegion(params);
  }

  // 获取IM接口前缀
  @Get('IM')
  async getIMDetail() {
    return this.commonService.getIMDetail();
  }

  // 获取图片logo
  @Get('site')
  async getBaseSite() {
    return this.commonService.getBaseSite();
  }

  // 发送短信验证码
  @Get('sms/:verificationEnums/:mobile')
  async sendSms(
    @Param('verificationEnums') verificationEnums: string,
    @Param('mobile') mobile: string,
    @Query() params: any
  ) {
    return this.commonService.sendSms(verificationEnums, mobile, params);
  }
}