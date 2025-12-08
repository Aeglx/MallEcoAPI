import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 用户注册
   * @param registerDto - 注册信息
   * @returns 注册结果
   */
  async register(registerDto: RegisterDto): Promise<any> {
    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: registerDto.username },
        { phone: registerDto.phone },
        { email: registerDto.email },
      ],
    });

    if (existingUser) {
      if (existingUser.username === registerDto.username) {
        throw new BadRequestException('用户名已存在');
      }
      if (existingUser.phone === registerDto.phone) {
        throw new BadRequestException('手机号已被注册');
      }
      if (existingUser.email === registerDto.email) {
        throw new BadRequestException('邮箱已被注册');
      }
    }

    // 密码加密
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    // 创建用户
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      nickname: registerDto.nickname || registerDto.username,
    });

    await this.userRepository.save(user);

    // 生成令牌
    const token = this.generateToken({ 
      sub: user.id, 
      username: user.username, 
      roles: [user.role] 
    });

    return {
      message: '注册成功',
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    };
  }

  /**
   * 用户登录
   * @param loginDto - 登录信息
   * @returns 登录结果
   */
  async login(loginDto: LoginDto): Promise<any> {
    // 根据用户名、手机号或邮箱查找用户
    const user = await this.userRepository.findOne({
      where: [
        { username: loginDto.usernameOrPhoneOrEmail },
        { phone: loginDto.usernameOrPhoneOrEmail },
        { email: loginDto.usernameOrPhoneOrEmail },
      ],
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户是否激活
    if (user.isActive === 0) {
      throw new UnauthorizedException('用户已被禁用');
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(loginDto.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 更新最后登录时间
    user.lastLoginTime = new Date();
    await this.userRepository.save(user);

    // 生成令牌
    const token = this.generateToken({ 
      sub: user.id, 
      username: user.username, 
      roles: [user.role] 
    });

    return {
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    };
  }

  /**
   * 获取用户信息
   * @param userId - 用户ID
   * @returns 用户信息
   */
  async getProfile(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'nickname', 'phone', 'email', 'role', 'avatar', 'lastLoginTime'],
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return {
      message: '获取成功',
      user,
    };
  }

  /**
   * 生成JWT令牌
   * @param payload - 令牌载荷
   * @returns JWT令牌
   */
  generateToken(payload: any): string {
    // 获取过期时间配置
    const jwtExpiration = this.configService.get<string>('JWT_EXPIRATION') || '7d';
    
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: jwtExpiration as any, // 使用类型断言确保兼容性
    });
  }

  /**
   * 验证JWT令牌
   * @param token - JWT令牌
   * @returns 令牌载荷
   */
  verifyToken(token: string): any {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }
}
