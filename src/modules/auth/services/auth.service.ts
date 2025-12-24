import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    // 尝试通过用户名、邮箱或手机号查找用户
    let user: User | undefined;
    
    user = await this.usersService.findByUsername(username);
    if (!user) {
      user = await this.usersService.findByEmail(username);
    }
    if (!user) {
      user = await this.usersService.findByPhone(username);
    }

    if (user && user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return user;
      }
    }

    return null;
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const { username, password } = loginDto;
    const user = await this.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : 3600, // 1小时
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ? parseInt(process.env.JWT_REFRESH_EXPIRES_IN) : 604800, // 7天
    });

    // 更新用户最后登录时间
    await this.usersService.update(user.id, {
      last_login_time: new Date(),
      last_login_ip: '127.0.0.1', // 这里应该从请求中获取真实IP
    });

    return { accessToken, refreshToken, user };
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const { username, email, phone, password, nickname } = registerDto;

    // 检查用户名是否已存在
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await this.usersService.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException('邮箱已存在');
    }

    // 检查手机号是否已存在
    if (phone) {
      const existingPhone = await this.usersService.findByPhone(phone);
      if (existingPhone) {
        throw new ConflictException('手机号已存在');
      }
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await this.usersService.create({
      username,
      password: hashedPassword,
      email,
      phone,
      nickname,
    });

    return user;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      });

      const newAccessToken = this.jwtService.sign(
        { username: payload.username, sub: payload.sub },
        {
          secret: process.env.JWT_SECRET || 'your-secret-key',
          expiresIn: process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : 3600, // 1小时
        },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }
}
