import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '用户名或邮箱或手机号', example: 'admin' })
  username: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  password: string;

  @ApiProperty({ description: '记住我', example: false, required: false })
  rememberMe?: boolean;
}
