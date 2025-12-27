import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, LessThanOrEqual } from 'typeorm';
import { SmsLog } from '../entities/sms-log.entity';
import { SmsTemplate } from '../entities/sms-template.entity';
import { SmsVerification } from '../entities/sms-verification.entity';
import { AliyunSmsService } from './aliyun-sms.service';

@Injectable()
export class SmsService {
  constructor(
    @InjectRepository(SmsLog) private readonly smsLogRepository: Repository<SmsLog>,
    @InjectRepository(SmsTemplate) private readonly smsTemplateRepository: Repository<SmsTemplate>,
    @InjectRepository(SmsVerification)
    private readonly smsVerificationRepository: Repository<SmsVerification>,
    private readonly aliyunSmsService: AliyunSmsService,
  ) {}

  /**
   * 发送短信验证码
   * @param phone 手机号
   * @param templateCode 模板代码
   * @param bizId 业务ID
   */
  async sendCode(phone: string, templateCode: string, bizId: string): Promise<void> {
    // 检查1分钟内是否发送过验证码
    const oneMinuteAgo = new Date();
    oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
    const recentCount = await this.smsVerificationRepository.count({
      where: {
        mobile: phone,
        businessType: bizId,
        createTime: MoreThan(oneMinuteAgo),
      },
    });

    if (recentCount > 0) {
      throw new BadRequestException('1分钟内只能发送一次验证码');
    }

    // 生成6位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + 10); // 10分钟过期

    try {
      // 调用阿里云短信服务发送验证码
      const result = await this.aliyunSmsService.sendSms(phone, templateCode, { code });

      // 保存短信日志
      const smsLog = new SmsLog();
      smsLog.mobile = phone;
      smsLog.templateCode = templateCode;
      smsLog.templateParam = { code };
      smsLog.content = `验证码：${code}`;
      smsLog.smsType = 1; // 1-验证码
      smsLog.businessType = bizId;
      smsLog.status = result.Code === 'OK' ? 1 : 0;
      smsLog.errorMsg = result.Code !== 'OK' ? result.Message : null;
      smsLog.requestId = result.RequestId;
      smsLog.sendTime = new Date();
      await this.smsLogRepository.save(smsLog);

      // 保存验证码记录
      if (result.Code === 'OK') {
        const smsVerification = new SmsVerification();
        smsVerification.mobile = phone;
        smsVerification.code = code;
        smsVerification.businessType = bizId;
        smsVerification.expireTime = expireTime;
        smsVerification.used = 0;
        await this.smsVerificationRepository.save(smsVerification);
      }
    } catch (error) {
      // 保存失败日志
      const smsLog = new SmsLog();
      smsLog.mobile = phone;
      smsLog.templateCode = templateCode;
      smsLog.templateParam = { code };
      smsLog.content = `验证码：${code}`;
      smsLog.smsType = 1;
      smsLog.businessType = bizId;
      smsLog.status = 0;
      smsLog.errorMsg = error.message;
      smsLog.sendTime = new Date();
      await this.smsLogRepository.save(smsLog);
      throw error;
    }
  }

  /**
   * 验证短信验证码
   * @param phone 手机号
   * @param code 验证码
   * @param bizId 业务ID
   * @returns 是否验证通过
   */
  async verifyCode(phone: string, code: string, bizId: string): Promise<boolean> {
    // 查询未使用且未过期的验证码
    const now = new Date();
    const verification = await this.smsVerificationRepository.findOne({
      where: {
        mobile: phone,
        code,
        businessType: bizId,
        used: 0,
        expireTime: MoreThan(now),
      },
      order: { createTime: 'DESC' },
    });

    if (!verification) {
      return false;
    }

    // 标记验证码为已使用
    verification.used = 1;
    await this.smsVerificationRepository.save(verification);
    return true;
  }

  /**
   * 发送普通短信
   * @param phone 手机号
   * @param templateCode 模板代码
   * @param params 模板参数
   * @param bizId 业务ID
   * @returns 发送结果
   */
  async sendSms(
    phone: string,
    templateCode: string,
    params: Record<string, any>,
    bizId?: string,
  ): Promise<any> {
    try {
      // 调用阿里云短信服务发送短信
      const result = await this.aliyunSmsService.sendSms(phone, templateCode, params);

      // 保存短信日志
      const smsLog = new SmsLog();
      smsLog.mobile = phone;
      smsLog.templateCode = templateCode;
      smsLog.templateParam = params;
      smsLog.smsType = 2; // 2-通知
      smsLog.businessType = bizId || 'common';
      smsLog.status = result.Code === 'OK' ? 1 : 0;
      smsLog.errorMsg = result.Code !== 'OK' ? result.Message : null;
      smsLog.requestId = result.RequestId;
      smsLog.sendTime = new Date();
      await this.smsLogRepository.save(smsLog);

      return result;
    } catch (error) {
      // 保存失败日志
      const smsLog = new SmsLog();
      smsLog.mobile = phone;
      smsLog.templateCode = templateCode;
      smsLog.templateParam = params;
      smsLog.smsType = 2;
      smsLog.businessType = bizId || 'common';
      smsLog.status = 0;
      smsLog.errorMsg = error.message;
      smsLog.sendTime = new Date();
      await this.smsLogRepository.save(smsLog);
      throw error;
    }
  }

  /**
   * 获取短信发送记录
   * @param phone 手机号
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页结果
   */
  async getSmsLogs(phone?: string, page: number = 1, limit: number = 10): Promise<any> {
    const queryBuilder = this.smsLogRepository.createQueryBuilder('smsLog');

    if (phone) {
      queryBuilder.where('smsLog.mobile = :phone', { phone });
    }

    queryBuilder.orderBy('smsLog.createTime', 'DESC');

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
   * 获取短信模板列表
   * @returns 短信模板列表
   */
  async getSmsTemplates(): Promise<SmsTemplate[]> {
    return await this.smsTemplateRepository.find({
      where: { status: 1 },
      order: { createTime: 'DESC' },
    });
  }
}
