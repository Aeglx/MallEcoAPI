import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Withdraw } from '../entities/withdraw.entity';
import { WalletService } from './wallet.service';
import { CustomException } from '../../common/filters/custom-exception';
import { CodeEnum } from '../../common/enums/code.enum';

@Injectable()
export class WithdrawService {
  constructor(
    @InjectRepository(Withdraw)
    private withdrawRepository: Repository<Withdraw>,
    private walletService: WalletService,
  ) {}

  /**
   * 创建提现申请
   */
  async createWithdraw(params: {
    memberId: string;
    memberName: string;
    amount: number;
    withdrawType: number;
    bankAccountId?: string;
    bankAccountNo?: string;
    accountName?: string;
    bankName?: string;
    alipayAccount?: string;
    alipayName?: string;
    wechatAccount?: string;
    wechatName?: string;
    payPassword?: string;
    remark?: string;
  }): Promise<Withdraw> {
    // 生成提现单号
    const withdrawNo = this.generateWithdrawNo();

    // 检查金额
    if (params.amount <= 0) {
      throw new CustomException(CodeEnum.INVALID_AMOUNT);
    }

    // 检查最低提现金额
    const minAmount = await this.getMinWithdrawAmount();
    if (params.amount < minAmount) {
      throw new CustomException(CodeEnum.WITHDRAW_AMOUNT_TOO_LOW);
    }

    // 获取钱包信息并验证余额
    const wallet = await this.walletService.getWallet(params.memberId);

    // 检查支付密码
    if (wallet.payPasswordStatus === 1) {
      if (!params.payPassword) {
        throw new CustomException(CodeEnum.PAY_PASSWORD_REQUIRED);
      }

      const isValidPassword = await this.walletService.validatePayPassword(
        params.memberId,
        params.payPassword
      );

      if (!isValidPassword) {
        throw new CustomException(CodeEnum.PAY_PASSWORD_ERROR);
      }
    }

    if (wallet.balance < params.amount) {
      throw new CustomException(CodeEnum.WITHDRAW_INSUFFICIENT_BALANCE);
    }

    // 检查当日提现限制
    await this.checkDailyWithdrawLimit(params.memberId, params.amount);

    // 计算手续费和税费
    const fee = this.calculateWithdrawFee(params.amount, params.withdrawType);
    const taxRate = await this.getWithdrawTaxRate();
    const taxAmount = params.amount * taxRate;
    const actualAmount = params.amount - fee - taxAmount;

    // 创建提现申请
    const withdraw = this.withdrawRepository.create({
      memberId: params.memberId,
      memberName: params.memberName,
      withdrawNo,
      amount: params.amount,
      actualAmount,
      fee,
      taxRate,
      taxAmount,
      withdrawType: params.withdrawType,
      bankAccountId: params.bankAccountId,
      bankAccountNo: params.bankAccountNo,
      accountName: params.accountName,
      bankName: params.bankName,
      alipayAccount: params.alipayAccount,
      alipayName: params.alipayName,
      wechatAccount: params.wechatAccount,
      wechatName: params.wechatName,
      auditStatus: 0, // 待审核
      processStatus: 0, // 待处理
      applyTime: new Date(),
      remark: params.remark,
    });

    const savedWithdraw = await this.withdrawRepository.save(withdraw);

    // 冻结余额
    await this.walletService.changeFrozenBalance({
      memberId: params.memberId,
      type: 1, // 冻结
      amount: params.amount,
      businessType: 'WITHDRAW',
      businessId: savedWithdraw.id,
      businessNo: withdrawNo,
      description: '提现申请冻结',
    });

    return savedWithdraw;
  }

  /**
   * 获取提现申请详情
   */
  async getWithdrawDetail(withdrawNo: string): Promise<Withdraw> {
    const withdraw = await this.withdrawRepository.findOne({
      where: { withdrawNo, deleteFlag: 0 }
    });

    if (!withdraw) {
      throw new CustomException(CodeEnum.WITHDRAW_NOT_FOUND);
    }

    return withdraw;
  }

  /**
   * 获取提现申请列表
   */
  async getWithdrawList(params: {
    memberId?: string;
    withdrawType?: number;
    auditStatus?: number;
    processStatus?: number;
    startTime?: Date;
    endTime?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ items: Withdraw[]; total: number }> {
    const { memberId, withdrawType, auditStatus, processStatus, startTime, endTime, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const whereCondition: any = { deleteFlag: 0 };

    if (memberId) {
      whereCondition.memberId = memberId;
    }

    if (withdrawType) {
      whereCondition.withdrawType = withdrawType;
    }

    if (auditStatus !== undefined) {
      whereCondition.auditStatus = auditStatus;
    }

    if (processStatus !== undefined) {
      whereCondition.processStatus = processStatus;
    }

    if (startTime && endTime) {
      whereCondition.createTime = Between(startTime, endTime);
    }

    const [items, total] = await this.withdrawRepository.findAndCount({
      where: whereCondition,
      order: { createTime: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 审核提现申请
   */
  async auditWithdraw(withdrawNo: string, params: {
    auditStatus: number; // 1-通过 2-拒绝
    auditorId: string;
    auditorName: string;
    auditRemark?: string;
    rejectReason?: string;
  }): Promise<void> {
    const withdraw = await this.getWithdrawDetail(withdrawNo);

    // 检查状态
    if (withdraw.auditStatus !== 0) {
      throw new CustomException(CodeEnum.WITHDRAW_ALREADY_AUDITED);
    }

    // 更新审核状态
    await this.withdrawRepository.update(
      { withdrawNo },
      {
        auditStatus: params.auditStatus,
        auditorId: params.auditorId,
        auditorName: params.auditorName,
        auditTime: new Date(),
        auditRemark: params.auditRemark,
        rejectReason: params.rejectReason,
      }
    );

    // 如果审核拒绝，解冻余额
    if (params.auditStatus === 2) {
      await this.walletService.changeFrozenBalance({
        memberId: withdraw.memberId,
        type: 2, // 解冻
        amount: withdraw.amount,
        businessType: 'WITHDRAW_REJECT',
        businessId: withdraw.id,
        businessNo: withdrawNo,
        description: `提现申请被拒绝：${params.rejectReason || ''}`,
      });
    }

    // 如果审核通过，更新处理状态
    if (params.auditStatus === 1) {
      await this.withdrawRepository.update(
        { withdrawNo },
        {
          processStatus: 1, // 处理中
        }
      );
    }
  }

  /**
   * 处理提现打款
   */
  async processWithdraw(withdrawNo: string, params: {
    paymentChannel: string;
    thirdTradeNo?: string;
  }): Promise<void> {
    const withdraw = await this.getWithdrawDetail(withdrawNo);

    // 检查状态
    if (withdraw.auditStatus !== 1) {
      throw new CustomException(CodeEnum.WITHDRAW_NOT_APPROVED);
    }

    if (withdraw.processStatus === 2) {
      throw new CustomException(CodeEnum.WITHDRAW_ALREADY_PROCESSED);
    }

    // 更新处理状态
    await this.withdrawRepository.update(
      { withdrawNo },
      {
        processStatus: 2, // 已完成
        paymentTime: new Date(),
        paymentChannel: params.paymentChannel,
        thirdTradeNo: params.thirdTradeNo,
      }
    );

    // 解冻并扣减余额
    await this.walletService.changeFrozenBalance({
      memberId: withdraw.memberId,
      type: 2, // 解冻
      amount: withdraw.amount,
      businessType: 'WITHDRAW_SUCCESS',
      businessId: withdraw.id,
      businessNo: withdrawNo,
      description: '提现成功',
    });

    // 记录余额支出
    await this.walletService.changeBalance({
      memberId: withdraw.memberId,
      type: 2, // 提现
      direction: 2, // 支出
      amount: withdraw.amount,
      businessType: 'WITHDRAW',
      businessId: withdraw.id,
      businessNo: withdrawNo,
      description: `提现 ${withdraw.amount}元，手续费 ${withdraw.fee}元，税费 ${withdraw.taxAmount}元`,
    });
  }

  /**
   * 提现失败处理
   */
  async handleWithdrawFailed(withdrawNo: string, failReason: string): Promise<void> {
    const withdraw = await this.getWithdrawDetail(withdrawNo);

    // 检查状态
    if (withdraw.processStatus === 2) {
      throw new CustomException(CodeEnum.WITHDRAW_ALREADY_PROCESSED);
    }

    // 更新状态
    await this.withdrawRepository.update(
      { withdrawNo },
      {
        processStatus: 3, // 处理失败
        failReason,
      }
    );

    // 解冻余额
    await this.walletService.changeFrozenBalance({
      memberId: withdraw.memberId,
      type: 2, // 解冻
      amount: withdraw.amount,
      businessType: 'WITHDRAW_FAILED',
      businessId: withdraw.id,
      businessNo: withdrawNo,
      description: `提现失败：${failReason}`,
    });

    // 更新当日提现失败次数
    await this.walletService.updateDailyWithdrawFailCount(withdraw.memberId);
  }

  /**
   * 取消提现申请
   */
  async cancelWithdraw(withdrawNo: string, reason?: string): Promise<void> {
    const withdraw = await this.getWithdrawDetail(withdrawNo);

    // 检查状态
    if (withdraw.auditStatus === 1) {
      throw new CustomException(CodeEnum.WITHDRAW_CANNOT_CANCEL);
    }

    if (withdraw.processStatus === 2) {
      throw new CustomException(CodeEnum.WITHDRAW_ALREADY_PROCESSED);
    }

    // 更新状态
    await this.withdrawRepository.update(
      { withdrawNo },
      {
        auditStatus: 3, // 取消
        processStatus: 3,
      }
    );

    // 解冻余额
    await this.walletService.changeFrozenBalance({
      memberId: withdraw.memberId,
      type: 2, // 解冻
      amount: withdraw.amount,
      businessType: 'WITHDRAW_CANCEL',
      businessId: withdraw.id,
      businessNo: withdrawNo,
      description: `取消提现申请：${reason || ''}`,
    });
  }

  /**
   * 提现统计
   */
  async getWithdrawStatistics(params?: {
    memberId?: string;
    withdrawType?: number;
    startTime?: Date;
    endTime?: Date;
  }): Promise<any> {
    const whereCondition: any = { deleteFlag: 0, auditStatus: 1 };

    if (params?.memberId) {
      whereCondition.memberId = params.memberId;
    }

    if (params?.withdrawType) {
      whereCondition.withdrawType = params.withdrawType;
    }

    if (params?.startTime && params?.endTime) {
      whereCondition.createTime = Between(params.startTime, params.endTime);
    }

    const withdraws = await this.withdrawRepository.find({ where: whereCondition });

    const totalCount = withdraws.length;
    const totalAmount = withdraws.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalActualAmount = withdraws.reduce((sum, item) => sum + Number(item.actualAmount), 0);
    const totalFee = withdraws.reduce((sum, item) => sum + Number(item.fee), 0);
    const totalTaxAmount = withdraws.reduce((sum, item) => sum + Number(item.taxAmount), 0);

    // 按类型统计
    const typeStatistics = {};
    withdraws.forEach(item => {
      if (!typeStatistics[item.withdrawType]) {
        typeStatistics[item.withdrawType] = {
          count: 0,
          amount: 0,
          actualAmount: 0,
          fee: 0,
          taxAmount: 0,
        };
      }
      typeStatistics[item.withdrawType].count++;
      typeStatistics[item.withdrawType].amount += Number(item.amount);
      typeStatistics[item.withdrawType].actualAmount += Number(item.actualAmount);
      typeStatistics[item.withdrawType].fee += Number(item.fee);
      typeStatistics[item.withdrawType].taxAmount += Number(item.taxAmount);
    });

    return {
      totalCount,
      totalAmount,
      totalActualAmount,
      totalFee,
      totalTaxAmount,
      typeStatistics,
    };
  }

  /**
   * 检查当日提现限制
   */
  private async checkDailyWithdrawLimit(memberId: string, amount: number): Promise<void> {
    // 这里应该从配置中读取限制
    const dailyLimit = 10000; // 当日最高提现10000元
    const dailyCountLimit = 5; // 当日最多5次

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const whereCondition = {
      memberId,
      auditStatus: 1, // 审核通过的
      createTime: { $gte: today, $lt: tomorrow } as any,
    };

    const todayWithdraws = await this.withdrawRepository.find({ where: whereCondition });

    const todayTotalAmount = todayWithdraws.reduce((sum, item) => sum + Number(item.amount), 0);
    const todayCount = todayWithdraws.length;

    if (todayCount >= dailyCountLimit) {
      throw new CustomException(CodeEnum.DAILY_WITHDRAW_COUNT_LIMIT_EXCEEDED);
    }

    if (todayTotalAmount + amount > dailyLimit) {
      throw new CustomException(CodeEnum.DAILY_WITHDRAW_AMOUNT_LIMIT_EXCEEDED);
    }
  }

  /**
   * 获取最低提现金额
   */
  private async getMinWithdrawAmount(): Promise<number> {
    // 这里应该从配置中读取
    return 10; // 最低提现10元
  }

  /**
   * 获取提现税率
   */
  private async getWithdrawTaxRate(): Promise<number> {
    // 这里应该从配置中读取
    return 0.01; // 1%税率
  }

  /**
   * 计算提现手续费
   */
  private calculateWithdrawFee(amount: number, withdrawType: number): number {
    // 这里可以根据提现方式和金额设置不同的手续费率
    const feeRates = {
      1: 0.006, // 支付宝 0.6%
      2: 0.006, // 微信 0.6%
      3: 0.005, // 银行卡 0.5%
    };

    const feeRate = feeRates[withdrawType] || 0.006;
    const minFee = 2; // 最低手续费2元
    const maxFee = 50; // 最高手续费50元

    let fee = amount * feeRate;
    fee = Math.max(fee, minFee);
    fee = Math.min(fee, maxFee);

    return Number(fee.toFixed(2));
  }

  /**
   * 生成提现单号
   */
  private generateWithdrawNo(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `WD${timestamp}${random}`;
  }
}