import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { WalletRecord } from '../entities/wallet-record.entity';
import { CustomException } from '../../filters/custom-exception';
import { CodeEnum } from '../../enums/code.enum';
import * as crypto from 'crypto';

@Injectable()
export class WalletSecurityService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletRecord)
    private walletRecordRepository: Repository<WalletRecord>,
  ) {}

  /**
   * 检查支付风险
   */
  async checkPaymentRisk(params: {
    memberId: string;
    amount: number;
    businessType?: string;
    deviceFingerprint?: string;
    ip?: string;
    userAgent?: string;
  }): Promise<{ riskLevel: number; riskReasons: string[]; allowPayment: boolean }> {
    const { memberId, amount, businessType, deviceFingerprint, ip, userAgent } = params;

    const riskReasons: string[] = [];
    let riskScore = 0;

    // 获取会员钱包信息
    const wallet = await this.walletRepository.findOne({
      where: { memberId, deleteFlag: 0 }
    });

    if (!wallet) {
      return { riskLevel: 3, riskReasons: ['钱包不存在'], allowPayment: false };
    }

    // 风险规则1：检查异常金额
    if (amount > 10000) {
      riskReasons.push('单笔交易金额过大');
      riskScore += 20;
    }

    if (amount > wallet.balance) {
      riskReasons.push('余额不足');
      return { riskLevel: 3, riskReasons, allowPayment: false };
    }

    // 风险规则2：检查异常频率
    const recentTransactions = await this.getRecentTransactionCount(memberId, 1); // 1小时内
    if (recentTransactions > 10) {
      riskReasons.push('短时间内交易频次过高');
      riskScore += 30;
    }

    // 风险规则3：检查新设备
    if (deviceFingerprint) {
      const isNewDevice = await this.checkNewDevice(memberId, deviceFingerprint);
      if (isNewDevice) {
        riskReasons.push('新设备登录');
        riskScore += 15;
      }
    }

    // 风险规则4：检查异常IP
    if (ip) {
      const isAbnormalIP = await this.checkAbnormalIP(memberId, ip);
      if (isAbnormalIP) {
        riskReasons.push('异常IP地址');
        riskScore += 25;
      }
    }

    // 风险规则5：检查夜间交易
    const currentHour = new Date().getHours();
    if (currentHour >= 23 || currentHour <= 6) {
      if (amount > 1000) {
        riskReasons.push('夜间大额交易');
        riskScore += 10;
      }
    }

    // 风险规则6：检查首次大额交易
    const totalTransactionAmount = await this.getTotalTransactionAmount(memberId);
    if (totalTransactionAmount < 100 && amount > 1000) {
      riskReasons.push('首次大额交易');
      riskScore += 15;
    }

    // 计算风险等级
    let riskLevel = 1; // 低风险
    if (riskScore >= 20 && riskScore < 40) {
      riskLevel = 2; // 中风险
    } else if (riskScore >= 40) {
      riskLevel = 3; // 高风险
    }

    return {
      riskLevel,
      riskReasons,
      allowPayment: riskLevel < 3,
    };
  }

  /**
   * 冻结可疑账户
   */
  async freezeSuspiciousAccount(memberId: string, reason: string, operatorId?: string): Promise<void> {
    const wallet = await this.walletRepository.findOne({
      where: { memberId, deleteFlag: 0 }
    });

    if (!wallet) {
      throw new CustomException(CodeEnum.WALLET_NOT_FOUND);
    }

    await this.walletRepository.update(
      { id: wallet.id },
      {
        status: 1, // 冻结
      }
    );

    // 记录冻结日志
    await this.walletRecordRepository.save({
      memberId,
      memberName: wallet.memberName,
      type: 9, // 冻结
      direction: 2, // 支出
      amount: 0,
      beforeBalance: wallet.balance,
      afterBalance: wallet.balance,
      beforeFrozenBalance: wallet.frozenBalance,
      afterFrozenBalance: wallet.frozenBalance + wallet.balance,
      description: `账户冻结：${reason}`,
      operatorId,
      status: 1, // 成功
      completeTime: new Date(),
    });
  }

  /**
   * 解冻账户
   */
  async unfreezeAccount(memberId: string, reason: string, operatorId?: string): Promise<void> {
    const wallet = await this.walletRepository.findOne({
      where: { memberId, deleteFlag: 0 }
    });

    if (!wallet) {
      throw new CustomException(CodeEnum.WALLET_NOT_FOUND);
    }

    if (wallet.status !== 1) {
      throw new CustomException(CodeEnum.WALLET_NOT_FROZEN);
    }

    await this.walletRepository.update(
      { id: wallet.id },
      {
        status: 0, // 正常
      }
    );

    // 记录解冻日志
    await this.walletRecordRepository.save({
      memberId,
      memberName: wallet.memberName,
      type: 10, // 解冻
      direction: 1, // 收入
      amount: 0,
      beforeBalance: wallet.balance,
      afterBalance: wallet.balance,
      beforeFrozenBalance: wallet.frozenBalance,
      afterFrozenBalance: 0,
      description: `账户解冻：${reason}`,
      operatorId,
      status: 1, // 成功
      completeTime: new Date(),
    });
  }

  /**
   * 记录安全日志
   */
  async logSecurityEvent(params: {
    memberId?: string;
    eventType: string;
    riskLevel: number;
    description: string;
    ip?: string;
    userAgent?: string;
    deviceFingerprint?: string;
    additionalData?: any;
  }): Promise<void> {
    // 这里应该创建专门的安全日志表
    // 简化实现，可以使用文件日志或专门的事件记录表
    console.log('Security Event:', {
      timestamp: new Date(),
      ...params,
    });
  }

  /**
   * 检查设备指纹
   */
  async checkDeviceFingerprint(memberId: string, deviceFingerprint: string): Promise<{
    isFirstTime: boolean;
    riskScore: number;
    deviceInfo?: any;
  }> {
    // 这里应该有专门的设备记录表
    // 简化实现，使用内存或Redis存储
    
    // 检查是否为新设备
    const existingDevices = await this.getMemberDevices(memberId);
    const existingDevice = existingDevices.find(device => device.fingerprint === deviceFingerprint);

    const isFirstTime = !existingDevice;
    let riskScore = 0;

    if (isFirstTime) {
      riskScore += 10; // 新设备风险
    } else {
      // 检查设备使用频率
      const deviceUsage = existingDevice?.usageCount || 0;
      if (deviceUsage < 5) {
        riskScore += 5; // 新设备低频使用
      }
    }

    return {
      isFirstTime,
      riskScore,
      deviceInfo: existingDevice,
    };
  }

  /**
   * 检查IP风险
   */
  async checkIPRisk(ip: string): Promise<{
    isHighRisk: boolean;
    isProxy: boolean;
    location?: string;
    riskScore: number;
  }> {
    // 这里应该接入IP风险检测服务
    // 简化实现，基于一些基本规则判断
    
    let riskScore = 0;
    let isHighRisk = false;
    let isProxy = false;
    let location = '未知';

    // 检查是否为内网IP
    if (this.isPrivateIP(ip)) {
      return { isHighRisk: false, isProxy: false, location, riskScore: 0 };
    }

    // 检查是否为已知代理IP（简化实现）
    const knownProxyRanges = [
      '10.0.0.0/8',
      '172.16.0.0/12',
      '192.168.0.0/16',
    ];

    isProxy = knownProxyRanges.some(range => this.isIPInRange(ip, range));
    if (isProxy) {
      riskScore += 20;
    }

    // 检查地理位置（简化实现）
    if (ip.startsWith('1.') || ip.startsWith('2.')) {
      location = '美国';
    } else if (ip.startsWith('58.') || ip.startsWith('59.')) {
      location = '中国';
    }

    // 检查是否为高风险地区
    const highRiskLocations = ['朝鲜', '伊朗', '古巴'];
    if (highRiskLocations.includes(location)) {
      riskScore += 30;
      isHighRisk = true;
    }

    return {
      isHighRisk,
      isProxy,
      location,
      riskScore,
    };
  }

  /**
   * 生成交易签名
   */
  generateTransactionSignature(params: {
    memberId: string;
    amount: number;
    orderNo: string;
    timestamp: number;
  }): string {
    const { memberId, amount, orderNo, timestamp } = params;
    
    // 按照约定的字段顺序拼接
    const signString = `${memberId}${amount}${orderNo}${timestamp}`;
    
    // 使用HMAC-SHA256签名
    const secretKey = process.env.WALLET_SECRET_KEY || 'default-secret-key';
    return crypto.createHmac('sha256', secretKey)
      .update(signString)
      .digest('hex');
  }

  /**
   * 验证交易签名
   */
  verifyTransactionSignature(params: {
    memberId: string;
    amount: number;
    orderNo: string;
    timestamp: number;
    signature: string;
  }): boolean {
    const expectedSignature = this.generateTransactionSignature({
      memberId: params.memberId,
      amount: params.amount,
      orderNo: params.orderNo,
      timestamp: params.timestamp,
    });

    return expectedSignature === params.signature;
  }

  /**
   * 加密敏感数据
   */
  encryptSensitiveData(data: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.WALLET_ENCRYPTION_KEY || 'default-encryption-key-32', 'hex');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    cipher.setAAD(Buffer.from('wallet-data')); // 附加认证数据
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // 组合IV、认证标签和加密数据
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * 解密敏感数据
   */
  decryptSensitiveData(encryptedData: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.WALLET_ENCRYPTION_KEY || 'default-encryption-key-32', 'hex');
    
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAAD(Buffer.from('wallet-data'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * 获取近期交易次数
   */
  private async getRecentTransactionCount(memberId: string, hours: number): Promise<number> {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    return await this.walletRecordRepository.count({
      where: {
        memberId,
        createTime: { $gte: startTime } as any,
        status: 1, // 成功的交易
        deleteFlag: 0,
      }
    });
  }

  /**
   * 获取总交易金额
   */
  private async getTotalTransactionAmount(memberId: string): Promise<number> {
    const records = await this.walletRecordRepository.find({
      where: {
        memberId,
        direction: 2, // 支出
        status: 1, // 成功
        deleteFlag: 0,
      }
    });

    return records.reduce((total, record) => total + Number(record.amount), 0);
  }

  /**
   * 检查新设备
   */
  private async checkNewDevice(memberId: string, deviceFingerprint: string): Promise<boolean> {
    const existingDevices = await this.getMemberDevices(memberId);
    return !existingDevices.some(device => device.fingerprint === deviceFingerprint);
  }

  /**
   * 检查异常IP
   */
  private async checkAbnormalIP(memberId: string, ip: string): Promise<boolean> {
    // 这里应该有IP使用记录表
    // 简化实现，假设检查是否为新IP
    const recentIPs = await this.getMemberRecentIPs(memberId, 7); // 7天内
    return !recentIPs.includes(ip);
  }

  /**
   * 获取会员设备列表
   */
  private async getMemberDevices(memberId: string): Promise<any[]> {
    // 这里应该从设备记录表查询
    // 简化实现，返回空数组
    return [];
  }

  /**
   * 获取会员近期IP
   */
  private async getMemberRecentIPs(memberId: string, days: number): Promise<string[]> {
    // 这里应该从IP使用记录表查询
    // 简化实现，返回空数组
    return [];
  }

  /**
   * 检查是否为内网IP
   */
  private isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./,
    ];

    return privateRanges.some(range => range.test(ip));
  }

  /**
   * 检查IP是否在指定范围内
   */
  private isIPInRange(ip: string, range: string): boolean {
    // 简化实现，实际应该进行CIDR计算
    return false;
  }
}