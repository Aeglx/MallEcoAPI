import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiCreateOperation, ApiGetOperation } from '../../../shared/decorators/swagger.decorator';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: '用户登录',
    description: '使用用户名和密码登录，成功后返回JWT访问令牌和刷新令牌',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '登录成功，返回JWT令牌',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: '访问令牌',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
          type: 'string',
          description: '刷新令牌',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        expiresIn: {
          type: 'number',
          description: '令牌过期时间（秒）',
          example: 3600,
        },
        user: {
          type: 'object',
          description: '用户信息',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('register')
  @ApiCreateOperation('用户注册', '注册新用户账号')
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: '注册成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'user123' },
        username: { type: 'string', example: 'newuser' },
        email: { type: 'string', example: 'user@example.com' },
        message: { type: 'string', example: '注册成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '注册信息错误，请检查输入' })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiGetOperation('获取当前用户信息', '获取当前登录用户的详细信息')
  @ApiResponse({
    status: 200,
    description: '获取用户信息成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'user123' },
        username: { type: 'string', example: 'admin' },
        email: { type: 'string', example: 'admin@example.com' },
        roles: {
          type: 'array',
          items: { type: 'string' },
          example: ['admin', 'user'],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: '刷新JWT令牌',
    description: '使用刷新令牌获取新的访问令牌',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description: '刷新令牌',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '令牌刷新成功',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: '新的访问令牌',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        expiresIn: {
          type: 'number',
          description: '令牌过期时间（秒）',
          example: 3600,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '无效的刷新令牌' })
  async refreshToken(@Body() body: { refreshToken: string }) {
    return await this.authService.refreshToken(body.refreshToken);
  }
}
