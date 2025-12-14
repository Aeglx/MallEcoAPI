import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailLog } from '../entities/email-log.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { EmailVerification } from '../entities/email-verification.entity';
import { SmtpEmailService } from './smtp-email.service';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailLog) private readonly emailLogRepository: Repository<EmailLog>,
    @InjectRepository(EmailTemplate) private readonly emailTemplateRepository: Repository<EmailTemplate>,
    @InjectRepository(EmailVerification) private readonly emailVerificationRepository: Repository<EmailVerification>,
    private readonly smtpEmailService: SmtpEmailService,
  ) {}

  /**
   * 发送邮件验证码
   * @param email 邮箱地址
   * @param templateCode 模板代码
   * @param bizId 业务ID
   */
  async sendCode(email: string, templateCode: string, bizId: string): Promise<void> {
    // 检查1分钟内是否发送过验证码
    const oneMinuteAgo = new Date();
    oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
    const recentCount = await this.emailVerificationRepository.count({
      where: {
        email,
        businessType: bizId,
        createTime: { $gte: oneMinuteAgo },
      },
    });

    if (recentCount > 0) {
      throw new BadRequestException('1分钟内只能发送一次验证码');
    }

    // 生成6位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + 30); // 30分钟过期

    try {
      // 查询邮件模板
      const template = await this.emailTemplateRepository.findOne({
        where: { templateCode, status: 1 },
      });

      if (!template) {
        throw new BadRequestException(`邮件模板 ${templateCode} 不存在或已禁用`);
      }

      // 替换模板内容中的验证码
      const content = template.templateContent.replace('{code}', code);

      // 调用SMTP服务发送邮件
      const result = await this.smtpEmailService.sendMail(
        email,
        template.subject,
        content,
        `验证码：${code}`
      );

      // 保存邮件日志
      const emailLog = new EmailLog();
      emailLog.toEmail = email;
      emailLog.subject = template.subject;
      emailLog.content = content;
      emailLog.emailType = 1; // 1-验证码
      emailLog.businessType = bizId;
      emailLog.status = 1;
      emailLog.sendTime = new Date();
      await this.emailLogRepository.save(emailLog);

      // 保存验证码记录
      const emailVerification = new EmailVerification();
      emailVerification.email = email;
      emailVerification.code = code;
      emailVerification.businessType = bizId;
      emailVerification.expireTime = expireTime;
      emailVerification.used = 0;
      await this.emailVerificationRepository.save(emailVerification);
    } catch (error) {
      // 保存失败日志
      const emailLog = new EmailLog();
      emailLog.toEmail = email;
      emailLog.subject = '验证码';
      emailLog.content = `验证码：${code}`;
      emailLog.emailType = 1;
      emailLog.businessType = bizId;
      emailLog.status = 0;
      emailLog.errorMsg = error.message;
      emailLog.sendTime = new Date();
      await this.emailLogRepository.save(emailLog);
      throw error;
    }
  }

  /**
   * 验证邮件验证码
   * @param email 邮箱地址
   * @param code 验证码
   * @param bizId 业务ID
   * @returns 是否验证通过
   */
  async verifyCode(email: string, code: string, bizId: string): Promise<boolean> {
    // 查询未使用且未过期的验证码
    const now = new Date();
    const verification = await this.emailVerificationRepository.findOne({
      where: {
        email,
        code,
        businessType: bizId,
        used: 0,
        expireTime: { $gte: now },
      },
      order: { createTime: 'DESC' },
    });

    if (!verification) {
      return false;
    }

    // 标记验证码为已使用
    verification.used = 1;
    await this.emailVerificationRepository.save(verification);
    return true;
  }

  /**
   * 发送普通邮件
   * @param email 邮箱地址
   * @param templateCode 模板代码
   * @param params 模板参数
   * @param bizId 业务ID
   * @returns 发送结果
   */
  async sendEmail(email: string, templateCode: string, params: Record<string, any>, bizId?: string): Promise<any> {
    try {
      // 查询邮件模板
      const template = await this.emailTemplateRepository.findOne({
        where: { templateCode, status: 1 },
      });

      if (!template) {
        throw new BadRequestException(`邮件模板 ${templateCode} 不存在或已禁用`);
      }

      // 替换模板内容中的参数
      let content = template.templateContent;
      Object.keys(params).forEach(key => {
        content = content.replace(`{${key}}`, params[key]);
      });

      // 调用SMTP服务发送邮件
      const result = await this.smtpEmailService.sendMail(
        email,
        template.subject,
        content
      );

      // 保存邮件日志
      const emailLog = new EmailLog();
      emailLog.toEmail = email;
      emailLog.subject = template.subject;
      emailLog.content = content;
      emailLog.emailType = 2; // 2-通知
      emailLog.businessType = bizId || 'common';
      emailLog.status = 1;
      emailLog.sendTime = new Date();
      await this.emailLogRepository.save(emailLog);

      return result;
    } catch (error) {
      // 保存失败日志
      const emailLog = new EmailLog();
      emailLog.toEmail = email;
      emailLog.subject = `模板: ${templateCode}`;
      emailLog.emailType = 2;
      emailLog.businessType = bizId || 'common';
      emailLog.status = 0;
      emailLog.errorMsg = error.message;
      emailLog.sendTime = new Date();
      await this.emailLogRepository.save(emailLog);
      throw error;
    }
  }

  /**
   * 获取邮件发送记录
   * @param email 邮箱地址
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页结果
   */
  async getEmailLogs(email?: string, page: number = 1, limit: number = 10): Promise<any> {
    const queryBuilder = this.emailLogRepository.createQueryBuilder('emailLog');

    if (email) {
      queryBuilder.where('emailLog.toEmail = :email', { email });
    }

    queryBuilder.orderBy('emailLog.createTime', 'DESC');
    
    const [logs, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      list: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取邮件模板列表
   * @returns 邮件模板列表
   */
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return await this.emailTemplateRepository.find({
      where: { status: 1 },
      orderBy: { createTime: 'DESC' },
    });
  }
}
