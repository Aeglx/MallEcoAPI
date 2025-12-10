import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { WalletRecord } from '../entities/wallet-record.entity';
import { Member } from '../../member/entities/member.entity';
import { CustomException } from '../../common/filters/custom-exception';
import { CodeEnum } from '../../common/enums/code.enum';
import * as crypto from 'crypto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletRecord)
    private walletRecordRepository: Repository<WalletRecord>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  /**
   * 创建会员钱包
   */
  async createWallet(memberId: string): Promise<Wallet> {
    // 检查会员是否存在
    const member = await this.memberRepository.findOne({
      where: { id: memberId, deleteFlag: 0 }
    });

    if (!member) {
      throw new CustomException(CodeEnum.MEMBER_NOT_FOUND);
    }

    // 检查钱包是否已存在
    let wallet = await this.walletRepository.findOne({
      where: { memberId, deleteFlag: 0 }
    });

    if (!wallet) {
      wallet = this.walletRepository.create({
        memberId,
        memberName: member.nickname || member.mobile,
        balance: 0,
        frozenBalance: 0,
        status: 0, // 正常
        payPasswordStatus: 0, // 未设置
      });

      wallet = await this.walletRepository.save(wallet);
    }

    return wallet;
  }

  /**
   * 获取会员钱包信息
   */
  async getWallet(memberId: string): Promise<Wallet> {
    let wallet = await this.walletRepository.findOne({
      where: { memberId, deleteFlag: 0 }
    });

    if (!wallet) {
      wallet = await this.createWallet(memberId);
    }

    return wallet;
  }

  /**
   * 钱包余额变动
   */
  async changeBalance(params: {
    memberId: string;
    type: number;
    direction: number;
    amount: number;
    businessType?: string;
    businessId?: string;
    businessNo?: string;
    description?: string;
    targetMemberId?: string;
    thirdTradeNo?: string;
    paymentChannel?: string;
    operatorId?: string;
    operatorName?: string;
    remark?: string;
  }): Promise<WalletRecord> {
    // 获取钱包信息
    const wallet = await this.getWallet(params.memberId);

    // 检查钱包状态
    if (wallet.status === 1) {
      throw new CustomException(CodeEnum.WALLET_FROZEN);
    }

    if (wallet.status === 2) {
      throw new CustomException(CodeEnum.WALLET_CLOSED);
    }

    const beforeBalance = wallet.balance;
    const beforeFrozenBalance = wallet.frozenBalance;
    let afterBalance = beforeBalance;
    let afterFrozenBalance = beforeFrozenBalance;

    // 根据变动类型处理金额
    switch (params.direction) {
      case 1: // 收入
        afterBalance = beforeBalance + params.amount;
        break;
      case 2: // 支出
        if (beforeBalance < params.amount) {
          throw new CustomException(CodeEnum.INSUFFICIENT_BALANCE);
        }
        afterBalance = beforeBalance - params.amount;
        break;
    }

    // 更新钱包余额
    await this.walletRepository.update(
      { id: wallet.id },
      {
        balance: afterBalance,
        frozenBalance: afterFrozenBalance,
        // 更新累计金额
        ...(params.direction === 1 && params.type === 1 && { totalRecharge: wallet.totalRecharge + params.amount }),
        ...(params.direction === 2 && params.type === 2 && { totalWithdraw: wallet.totalWithdraw + params.amount }),
        ...(params.direction === 2 && params.type === 3 && { totalConsume: wallet.totalConsume + params.amount }),
        ...(params.direction === 1 && params.type === 5 && { totalCommission: wallet.totalCommission + params.amount }),
        // 更新最后时间
        ...(params.type === 1 && { lastRechargeTime: new Date() }),
        ...(params.type === 2 && { lastWithdrawTime: new Date() }),
        ...(params.type === 3 && { lastConsumeTime: new Date() }),
      }
    );

    // 创建流水记录
    const record = this.walletRecordRepository.create({
      memberId: params.memberId,
      memberName: wallet.memberName,
      type: params.type,
      direction: params.direction,
      amount: params.amount,
      beforeBalance,
      afterBalance,
      beforeFrozenBalance,
      afterFrozenBalance,
      businessType: params.businessType,
      businessId: params.businessId,
      businessNo: params.businessNo,
      description: params.description,
      targetMemberId: params.targetMemberId,
      thirdTradeNo: params.thirdTradeNo,
      paymentChannel: params.paymentChannel,
      operatorId: params.operatorId,
      operatorName: params.operatorName,
      remark: params.remark,
      status: 1, // 成功
      completeTime: new Date(),
    });

    return await this.walletRecordRepository.save(record);
  }

  /**
   * 钱包冻结/解冻
   */
  async changeFrozenBalance(params: {
    memberId: string;
    type: number; // 1-冻结 2-解冻
    amount: number;
    businessType?: string;
    businessId?: string;
    businessNo?: string;
    description?: string;
    operatorId?: string;
    operatorName?: string;
    remark?: string;
  }): Promise<WalletRecord> {
    const wallet = await this.getWallet(params.memberId);

    const beforeBalance = wallet.balance;
    const beforeFrozenBalance = wallet.frozenBalance;
    let afterBalance = beforeBalance;
    let afterFrozenBalance = beforeFrozenBalance;

    // 处理冻结/解冻
    switch (params.type) {
      case 1: // 冻结
        if (beforeBalance < params.amount) {
          throw new CustomException(CodeEnum.INSUFFICIENT_BALANCE);
        }
        afterBalance = beforeBalance - params.amount;
        afterFrozenBalance = beforeFrozenBalance + params.amount;
        break;
      case 2: // 解冻
        if (beforeFrozenBalance < params.amount) {
          throw new CustomException(CodeEnum.INSUFFICIENT_FROZEN_BALANCE);
        }
        afterBalance = beforeBalance + params.amount;
        afterFrozenBalance = beforeFrozenBalance - params.amount;
        break;
    }

    // 更新钱包
    await this.walletRepository.update(
      { id: wallet.id },
      {
        balance: afterBalance,
        frozenBalance: afterFrozenBalance,
      }
    );

    // 创建流水记录
    const record = this.walletRecordRepository.create({
      memberId: params.memberId,
      memberName: wallet.memberName,
      type: params.type === 1 ? 9 : 10, // 冻结/解冻
      direction: params.type === 1 ? 2 : 1, // 冻结是支出，解冻是收入
      amount: params.amount,
      beforeBalance,
      afterBalance,
      beforeFrozenBalance,
      afterFrozenBalance,
      businessType: params.businessType,
      businessId: params.businessId,
      businessNo: params.businessNo,
      description: params.description,
      operatorId: params.operatorId,
      operatorName: params.operatorName,
      remark: params.remark,
      status: 1, // 成功
      completeTime: new Date(),
    });

    return await this.walletRecordRepository.save(record);
  }

  /**
   * 钱包转账
   */
  async transfer(params: {
    fromMemberId: string;
    toMemberId: string;
    amount: number;
    description?: string;
    payPassword?: string;
    remark?: string;
  }): Promise<{ fromRecord: WalletRecord; toRecord: WalletRecord }> {
    // 检查发送方钱包
    const fromWallet = await this.getWallet(params.fromMemberId);

    // 检查支付密码
    if (fromWallet.payPasswordStatus === 1) {
      if (!params.payPassword) {
        throw new CustomException(CodeEnum.PAY_PASSWORD_REQUIRED);
      }

      const isValidPassword = this.validatePayPassword(
        params.payPassword,
        fromWallet.payPassword,
        fromWallet.payPasswordSalt
      );

      if (!isValidPassword) {
        throw new CustomException(CodeEnum.PAY_PASSWORD_ERROR);
      }
    }

    // 检查接收方
    const toWallet = await this.getWallet(params.toMemberId);

    if (params.fromMemberId === params.toMemberId) {
      throw new CustomException(CodeEnum.CANNOT_TRANSFER_TO_SELF);
    }

    if (fromWallet.balance < params.amount) {
      throw new CustomException(CodeEnum.INSUFFICIENT_BALANCE);
    }

    // 执行转账
    const fromRecord = await this.changeBalance({
      memberId: params.fromMemberId,
      type: 8, // 转账
      direction: 2, // 支出
      amount: params.amount,
      targetMemberId: params.toMemberId,
      description: `转账给${toWallet.memberName}: ${params.description || ''}`,
      remark: params.remark,
    });

    const toRecord = await this.changeBalance({
      memberId: params.toMemberId,
      type: 8, // 转账
      direction: 1, // 收入
      amount: params.amount,
      targetMemberId: params.fromMemberId,
      description: `收到${fromWallet.memberName}转账: ${params.description || ''}`,
      remark: params.remark,
    });

    return { fromRecord, toRecord };
  }

  /**
   * 设置支付密码
   */
  async setPayPassword(memberId: string, password: string): Promise<void> {
    const wallet = await this.getWallet(memberId);

    const salt = this.generateSalt();
    const hashedPassword = this.hashPassword(password, salt);

    await this.walletRepository.update(
      { id: wallet.id },
      {
        payPassword: hashedPassword,
        payPasswordSalt: salt,
        payPasswordStatus: 1, // 已设置
      }
    );
  }

  /**
   * 修改支付密码
   */
  async changePayPassword(memberId: string, oldPassword: string, newPassword: string): Promise<void> {
    const wallet = await this.getWallet(memberId);

    if (wallet.payPasswordStatus !== 1) {
      throw new CustomException(CodeEnum.PAY_PASSWORD_NOT_SET);
    }

    const isValidOldPassword = this.validatePayPassword(
      oldPassword,
      wallet.payPassword,
      wallet.payPasswordSalt
    );

    if (!isValidOldPassword) {
      throw new CustomException(CodeEnum.OLD_PAY_PASSWORD_ERROR);
    }

    const salt = this.generateSalt();
    const hashedNewPassword = this.hashPassword(newPassword, salt);

    await this.walletRepository.update(
      { id: wallet.id },
      {
        payPassword: hashedNewPassword,
        payPasswordSalt: salt,
      }
    );
  }

  /**
   * 验证支付密码
   */
  async validatePayPassword(memberId: string, password: string): Promise<boolean> {
    const wallet = await this.getWallet(memberId);

    if (wallet.payPasswordStatus !== 1) {
      return false;
    }

    return this.validatePayPassword(password, wallet.payPassword, wallet.payPasswordSalt);
  }

  /**
   * 重置支付密码
   */
  async resetPayPassword(memberId: string, newPassword: string, verifyCode: string): Promise<void> {
    // 这里应该验证短信验证码
    // const isValidCode = await this.validateVerifyCode(memberId, verifyCode);
    // if (!isValidCode) {
    //   throw new CustomException(CodeEnum.VERIFY_CODE_ERROR);
    // }

    const wallet = await this.getWallet(memberId);

    const salt = this.generateSalt();
    const hashedPassword = this.hashPassword(newPassword, salt);

    await this.walletRepository.update(
      { id: wallet.id },
      {
        payPassword: hashedPassword,
        payPasswordSalt: salt,
        payPasswordStatus: 1,
      }
    );
  }

  /**
   * 获取钱包流水记录
   */
  async getWalletRecords(params: {
    memberId?: string;
    type?: number;
    direction?: number;
    startTime?: Date;
    endTime?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ items: WalletRecord[]; total: number }> {
    const { memberId, type, direction, startTime, endTime, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const whereCondition: any = { deleteFlag: 0 };

    if (memberId) {
      whereCondition.memberId = memberId;
    }

    if (type) {
      whereCondition.type = type;
    }

    if (direction) {
      whereCondition.direction = direction;
    }

    if (startTime && endTime) {
      whereCondition.createTime = Between(startTime, endTime);
    }

    const [items, total] = await this.walletRecordRepository.findAndCount({
      where: whereCondition,
      order: { createTime: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 钱包统计
   */
  async getWalletStatistics(memberId?: string): Promise<any> {
    const whereCondition = memberId ? { memberId, deleteFlag: 0 } : { deleteFlag: 0 };

    const wallets = await this.walletRepository.find({ where: whereCondition });

    const totalBalance = wallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0);
    const totalFrozenBalance = wallets.reduce((sum, wallet) => sum + Number(wallet.frozenBalance), 0);
    const totalRecharge = wallets.reduce((sum, wallet) => sum + Number(wallet.totalRecharge), 0);
    const totalWithdraw = wallets.reduce((sum, wallet) => sum + Number(wallet.totalWithdraw), 0);
    const totalConsume = wallets.reduce((sum, wallet) => sum + Number(wallet.totalConsume), 0);
    const totalCommission = wallets.reduce((sum, wallet) => sum + Number(wallet.totalCommission), 0);

    return {
      totalCount: wallets.length,
      totalBalance,
      totalFrozenBalance,
      totalRecharge,
      totalWithdraw,
      totalConsume,
      totalCommission,
    };
  }

  /**
   * 工具方法：生成盐值
   */
  private generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * 工具方法：密码哈希
   */
  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  }

  /**
   * 工具方法：验证密码
   */
  private validatePayPassword(password: string, hashedPassword: string, salt: string): boolean {
    const hash = this.hashPassword(password, salt);
    return hash === hashedPassword;
  }
}