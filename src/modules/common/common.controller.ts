import { Controller, Get, Query, Param, Post, Body, Headers } from '@nestjs/common';
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
    @Query() params: any,
  ) {
    return this.commonService.sendSms(verificationEnums, mobile, params);
  }

  // 获取滑块验证码图片
  @Get('slider/:verificationEnums')
  async getSliderCaptcha(
    @Headers('uuid') uuid: string,
    @Param('verificationEnums') verificationEnums: string,
  ) {
    try {
      if (!uuid) {
        return { success: false, message: 'UUID不能为空' };
      }
      const result = await this.commonService.createSliderCaptcha(verificationEnums as any, uuid);
      return { success: true, result };
    } catch (error: any) {
      console.error('获取滑块验证码失败:', error);
      return {
        success: false,
        message: error.message || '获取滑块验证码失败',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    }
  }

  // 验证滑块验证码
  @Post('slider/:verificationEnums')
  async verifySliderCaptcha(
    @Headers('uuid') uuid: string,
    @Param('verificationEnums') verificationEnums: string,
    @Body() body: { xPos?: number; x?: number; y?: number },
  ) {
    if (!uuid) {
      return { success: false, message: 'UUID不能为空' };
    }
    try {
      // 兼容 xPos 和 x 两种参数名
      const xPos = body.xPos || body.x;
      const yPos = body.y;
      if (xPos === undefined || xPos === null) {
        return { success: false, message: 'X坐标不能为空' };
      }
      const result = await this.commonService.preCheckSliderCaptcha(
        xPos,
        uuid,
        verificationEnums as any,
        yPos, // 修复：传递Y坐标进行验证
      );
      return { success: true, result };
    } catch (error: any) {
      return { success: false, message: error.message || '验证失败' };
    }
  }
}
