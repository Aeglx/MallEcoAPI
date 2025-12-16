import { Controller, Get, Post, Put, Patch, Query, Headers, Body, Param } from '@nestjs/common';
import { MemberService } from '../services/member.service';

@Controller('buyer/passport/member')
export class MemberBuyerController {
  constructor(private readonly memberService: MemberService) {}

  @Post('pc_session')
  createPcSession() {
    return {
      success: true,
      result: this.memberService.createPcSession()
    };
  }

  @Post('session_login/:token')
  loginWithSession(@Param('token') token: string, @Query('beforeSessionStatus') beforeSessionStatus: number) {
    const result = this.memberService.loginWithSession(token);
    return {
      success: true,
      result: result
    };
  }

  @Post('app_scanner')
  appScanner(@Query('token') token: string) {
    return {
      success: true,
      result: this.memberService.appScanner(token)
    };
  }

  @Post('app_confirm')
  appSConfirm(@Query('token') token: string, @Query('code') code: number) {
    const result = this.memberService.appSConfirm(token, code);
    return {
      success: result,
      message: result ? '操作成功' : '操作失败'
    };
  }

  @Post('userLogin')
  userLogin(@Query('username') username: string, @Query('password') password: string, @Headers('uuid') uuid: string) {
    const result = this.memberService.usernameLogin(username, password);
    if (result) {
      return {
        success: true,
        result: result
      };
    }
    return {
      success: false,
      message: '用户名或密码错误'
    };
  }

  @Post('logout')
  logout() {
    const result = this.memberService.logout('MEMBER');
    return {
      success: result,
      message: result ? '退出成功' : '退出失败'
    };
  }

  @Post('smsLogin')
  smsLogin(@Query('mobile') mobile: string, @Query('code') code: string, @Headers('uuid') uuid: string) {
    // 简化实现，跳过短信验证码验证
    const result = this.memberService.mobilePhoneLogin(mobile);
    if (result) {
      return {
        success: true,
        result: result
      };
    }
    return {
      success: false,
      message: '登录失败'
    };
  }

  @Post('bindMobile')
  bindMobile(@Query('username') username: string, @Query('mobile') mobile: string, @Query('code') code: string, @Headers('uuid') uuid: string) {
    // 简化实现，跳过短信验证码验证
    const member = this.memberService.findByUsername(username);
    if (member) {
      const result = this.memberService.changeMobile(member.id, mobile);
      if (result) {
        return {
          success: true,
          result: result
        };
      }
    }
    return {
      success: false,
      message: '绑定失败'
    };
  }

  @Post('register')
  register(@Query('username') username: string, @Query('password') password: string, @Query('mobilePhone') mobilePhone: string, @Headers('uuid') uuid: string, @Query('code') code: string) {
    // 简化实现，跳过短信验证码验证
    const result = this.memberService.register(username, password, mobilePhone);
    if (result) {
      return {
        success: true,
        result: result
      };
    }
    return {
      success: false,
      message: '注册失败'
    };
  }

  @Get()
  getUserInfo() {
    const result = this.memberService.getUserInfo();
    return {
      success: true,
      result: result
    };
  }

  @Post('resetByMobile')
  resetByMobile(@Query('mobile') mobile: string, @Query('code') code: string, @Headers('uuid') uuid: string) {
    // 简化实现，跳过短信验证码验证
    const member = this.memberService.findByMobile(uuid, mobile);
    if (member) {
      return {
        success: true,
        message: '验证成功'
      };
    }
    return {
      success: false,
      message: '验证失败'
    };
  }

  @Post('resetPassword')
  resetPassword(@Query('password') password: string, @Headers('uuid') uuid: string) {
    const result = this.memberService.resetByMobile(uuid, password);
    return {
      success: true,
      result: result
    };
  }

  @Put('editOwn')
  editOwn(@Body() memberEditDTO: any) {
    const result = this.memberService.editOwn(memberEditDTO);
    return {
      success: true,
      result: result
    };
  }

  @Put('modifyPass')
  modifyPass(@Query('password') password: string, @Query('newPassword') newPassword: string) {
    const result = this.memberService.modifyPass(password, newPassword);
    return {
      success: true,
      result: result
    };
  }

  @Put('canInitPassword')
  canInitPassword() {
    const result = this.memberService.canInitPass();
    return {
      success: true,
      result: result
    };
  }

  @Put('initPassword')
  initPassword(@Query('password') password: string) {
    const result = this.memberService.initPass(password);
    return {
      success: result,
      message: result ? '密码设置成功' : '密码设置失败'
    };
  }

  @Put('cancellation')
  cancellation() {
    const result = this.memberService.cancellation();
    return {
      success: result,
      message: result ? '账号注销成功' : '账号注销失败'
    };
  }

  @Get('refresh/:refreshToken')
  refreshToken(@Param('refreshToken') refreshToken: string) {
    const result = this.memberService.refreshToken(refreshToken);
    return {
      success: true,
      result: result
    };
  }

  @Get('getImUser')
  getImUser() {
    const result = this.memberService.getUserInfo();
    return {
      success: true,
      result: result
    };
  }

  @Get('getImUserDetail/:memberId')
  getImUserDetail(@Param('memberId') memberId: string) {
    const result = this.memberService.getById(memberId);
    return {
      success: true,
      result: result
    };
  }
}
