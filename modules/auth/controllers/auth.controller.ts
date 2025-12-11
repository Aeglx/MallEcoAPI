import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Request, 
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@ApiTags('认证授权')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '登录失败' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    
    if (result.success) {
      return {
        code: HttpStatus.OK,
        message: '登录成功',
        data: {
          token: result.token,
          user: result.user,
          expiresIn: result.expiresIn,
        },
      };
    } else {
      return {
        code: HttpStatus.UNAUTHORIZED,
        message: result.message || '登录失败',
        data: null,
      };
    }
  }

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 400, description: '注册失败' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    
    if (result.success) {
      return {
        code: HttpStatus.CREATED,
        message: '注册成功',
        data: result.user,
      };
    } else {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: result.message || '注册失败',
        data: null,
      };
    }
  }

  @Post('refresh-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '刷新Token' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  async refreshToken(@Request() req) {
    const user = req.user;
    const result = await this.authService.refreshToken(user);
    
    return {
      code: HttpStatus.OK,
      message: '刷新成功',
      data: {
        token: result.token,
        expiresIn: result.expiresIn,
      },
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '用户登出' })
  @ApiResponse({ status: 200, description: '登出成功' })
  async logout(@Request() req) {
    const user = req.user;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    await this.authService.logout(user.userId, token);
    
    return {
      code: HttpStatus.OK,
      message: '登出成功',
    };
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '修改密码' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: '修改成功' })
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    const user = req.user;
    const result = await this.authService.changePassword(user.userId, changePasswordDto);
    
    if (result.success) {
      return {
        code: HttpStatus.OK,
        message: '密码修改成功',
      };
    } else {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: result.message || '密码修改失败',
      };
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: '重置密码' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: '重置成功' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(resetPasswordDto);
    
    if (result.success) {
      return {
        code: HttpStatus.OK,
        message: '密码重置成功',
      };
    } else {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: result.message || '密码重置失败',
      };
    }
  }

  @Get('verify-code')
  @ApiOperation({ summary: '验证验证码' })
  @ApiResponse({ status: 200, description: '验证成功' })
  async verifyCode(@Query('email') email: string, @Query('code') code: string) {
    const result = await this.authService.verifyCode(email, code);
    
    return {
      code: HttpStatus.OK,
      message: result.message,
      data: { valid: result.valid },
    };
  }

  @Get('user-info')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '获取用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserInfo(@Request() req) {
    const user = req.user;
    const userInfo = await this.authService.getUserInfo(user.userId);
    
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: userInfo,
    };
  }
}