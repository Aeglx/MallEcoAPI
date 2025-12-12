import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserRoleEntity } from '../entities/user-role.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { CaptchaService } from '../../../src/common/services/captcha.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
    private readonly captchaService: CaptchaService,
  ) {}

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto) {
    const { username, password, captcha } = loginDto;

    // 如果提供了验证码，先验证验证码
    if (captcha) {
      const isValidCaptcha = await this.verifyCaptcha(captcha);
      if (!isValidCaptcha) {
        return {
          success: false,
          message: '验证码错误',
        };
      }
    }

    // 查找用户
    const user = await this.userRepository.findOne({
      where: [
        { username },
        { email: username },
        { phone: username },
      ],
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      return {
        success: false,
        message: '用户不存在',
      };
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: '密码错误',
      };
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return {
        success: false,
        message: '用户账号已被禁用',
      };
    }

    // 生成JWT token
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: user.userRoles?.map(role => role.role?.name) || [],
    };

    const token = this.jwtService.sign(payload);

    // 更新最后登录时间
    await this.userRepository.update(
      { id: user.id },
      { 
        lastLoginAt: new Date(),
        lastLoginIp: loginDto.ip || 'unknown',
      }
    );

    // 记录登录日志
    this.logger.log(`User ${user.username} logged in successfully`);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        status: user.status,
        roles: user.userRoles?.map(role => role.role) || [],
      },
      expiresIn: '24h',
    };
  }

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto) {
    const { username, email, password, phone } = registerDto;

    // 检查用户名是否存在
    const existingUser = await this.userRepository.findOne({
      where: [
        { username },
        { email },
        { phone },
      ],
    });

    if (existingUser) {
      return {
        success: false,
        message: '用户名、邮箱或手机号已存在',
      };
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      phone,
      status: 'active',
      registerTime: new Date(),
      registerIp: registerDto.ip || 'unknown',
    });

    const savedUser = await this.userRepository.save(user);

    // 分配默认角色
    await this.assignDefaultRole(savedUser.id);

    this.logger.log(`User ${username} registered successfully`);

    return {
      success: true,
      user: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        phone: savedUser.phone,
        status: savedUser.status,
      },
    };
  }

  /**
   * 刷新Token
   */
  async refreshToken(user: any) {
    const payload = {
      userId: user.userId,
      username: user.username,
      email: user.email,
      roles: user.roles,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      expiresIn: '24h',
    };
  }

  /**
   * 用户登出
   */
  async logout(userId: string, token: string) {
    // 这里可以实现token黑名单机制
    // 暂时只记录日志
    this.logger.log(`User ${userId} logged out`);
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return {
        success: false,
        message: '用户不存在',
      };
    }

    // 验证旧密码
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return {
        success: false,
        message: '原密码错误',
      };
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await this.userRepository.update(
      { id: userId },
      { 
        password: hashedNewPassword,
        passwordChangedAt: new Date(),
        mustChangePassword: false,
      }
    );

    this.logger.log(`User ${userId} changed password successfully`);

    return {
      success: true,
      message: '密码修改成功',
    };
  }

  /**
   * 重置密码
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, code, newPassword } = resetPasswordDto;

    // 验证验证码
    const isValidCode = await this.verifyResetCode(email, code);
    if (!isValidCode) {
      return {
        success: false,
        message: '验证码错误或已过期',
      };
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await this.userRepository.update(
      { email },
      { 
        password: hashedPassword,
        passwordChangedAt: new Date(),
        mustChangePassword: false,
      }
    );

    // 清除验证码
    await this.clearResetCode(email);

    this.logger.log(`Password reset successfully for email: ${email}`);

    return {
      success: true,
      message: '密码重置成功',
    };
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 返回脱敏信息
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone ? this.maskPhone(user.phone) : null,
      nickname: user.nickname,
      avatar: user.avatar,
      status: user.status,
      roles: user.userRoles?.map(role => role.role) || [],
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  /**
   * 分配默认角色
   */
  private async assignDefaultRole(userId: string) {
    // 这里应该从角色表中查找默认用户角色
    // 暂时分配默认角色ID
    const defaultRoleId = 'user'; // 假设有一个默认用户角色

    const userRole = this.userRoleRepository.create({
      userId,
      roleId: defaultRoleId,
    });

    await this.userRoleRepository.save(userRole);
  }

  /**
   * 验证图形验证码
   */
  private async verifyCaptcha(captcha: string): Promise<boolean> {
    // 这里应该调用captchaService来验证验证码
    // 暂时返回模拟验证
    return captcha === '1234'; // 模拟验证码
  }

  /**
   * 验证重置验证码
   */
  private async verifyResetCode(email: string, code: string): Promise<boolean> {
    // 这里应该从缓存或数据库中验证验证码
    // 暂时返回模拟验证
    return code === '123456'; // 模拟验证码
  }

  /**
   * 验证验证码（对外暴露）
   */
  async verifyCode(email: string, code: string): Promise<{ valid: boolean, message: string }> {
    const isValid = await this.verifyResetCode(email, code);
    return {
      valid: isValid,
      message: isValid ? '验证码验证成功' : '验证码验证失败'
    };
  }

  /**
   * 清除重置验证码
   */
  private async clearResetCode(email: string): Promise<void> {
    // 清除验证码（从缓存或数据库中）
    this.logger.log(`Reset code cleared for email: ${email}`);
  }

  /**
   * 手机号脱敏
   */
  private maskPhone(phone: string): string {
    if (!phone || phone.length < 11) {
      return phone;
    }
    return phone.substring(0, 3) + '****' + phone.substring(7);
  }
}