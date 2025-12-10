import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Recharge } from '../entities/recharge.entity';
import { WalletService } from './wallet.service';
import { CustomException } from '../../common/filters/custom-exception';
import { CodeEnum } from '../../common/enums/code.enum';

@Injectable()
export class RechargeService {
  constructor(
    @InjectRepository(Recharge)
    private rechargeRepository: Repository<Recharge>,
    private walletService: WalletService,
  ) {}

  /**
   * 创建充值订单
   */
  async createRecharge(params: {
    memberId: string;
    memberName: string;
    amount: number;
    rechargeType: number;
    returnUrl?: string;
    notifyUrl?: string;
    remark?: string;
  }): Promise<Recharge> {
    // 生成充值订单号
    const orderNo = this.generateRechargeOrderNo();

    // 检查金额
    if (params.amount <= 0) {
      throw new CustomException(CodeEnum.INVALID_AMOUNT);
    }

    // 计算手续费（如果有）
    const fee = this.calculateRechargeFee(params.amount, params.rechargeType);
    const actualAmount = params.amount - fee;

    // 创建充值订单
    const recharge = this.rechargeRepository.create({
      memberId: params.memberId,
      memberName: params.memberName,
      orderNo,
      amount: params.amount,
      actualAmount,
      fee,
      rechargeType: params.rechargeType,
      payStatus: 0, // 待支付
      accountStatus: 0, // 未到账
      remark: params.remark,
    });

    return await this.rechargeRepository.save(recharge);
  }

  /**
   * 获取充值订单详情
   */
  async getRechargeDetail(orderNo: string): Promise<Recharge> {
    const recharge = await this.rechargeRepository.findOne({
      where: { orderNo, deleteFlag: 0 }
    });

    if (!recharge) {
      throw new CustomException(CodeEnum.RECHARGE_ORDER_NOT_FOUND);
    }

    return recharge;
  }

  /**
   * 获取充值记录列表
   */
  async getRechargeList(params: {
    memberId?: string;
    rechargeType?: number;
    payStatus?: number;
    startTime?: Date;
    endTime?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ items: Recharge[]; total: number }> {
    const { memberId, rechargeType, payStatus, startTime, endTime, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const whereCondition: any = { deleteFlag: 0 };

    if (memberId) {
      whereCondition.memberId = memberId;
    }

    if (rechargeType) {
      whereCondition.rechargeType = rechargeType;
    }

    if (payStatus !== undefined) {
      whereCondition.payStatus = payStatus;
    }

    if (startTime && endTime) {
      whereCondition.createTime = Between(startTime, endTime);
    }

    const [items, total] = await this.rechargeRepository.findAndCount({
      where: whereCondition,
      order: { createTime: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 支付成功回调处理
   */
  async handlePaymentSuccess(orderNo: string, params: {
    thirdPayNo: string;
    paymentChannel: string;
    callbackData?: string;
    actualAmount?: number;
    fee?: number;
  }): Promise<void> {
    const recharge = await this.getRechargeDetail(orderNo);

    // 检查订单状态
    if (recharge.payStatus === 2) {
      // 已经支付成功，幂等处理
      return;
    }

    if (recharge.payStatus !== 0 && recharge.payStatus !== 1) {
      throw new CustomException(CodeEnum.RECHARGE_ORDER_STATUS_ERROR);
    }

    // 更新订单状态
    await this.rechargeRepository.update(
      { orderNo },
      {
        payStatus: 2, // 支付成功
        thirdPayNo: params.thirdPayNo,
        paymentChannel: params.paymentChannel,
        callbackData: params.callbackData,
        actualAmount: params.actualAmount || recharge.actualAmount,
        fee: params.fee || recharge.fee,
        payTime: new Date(),
        completeTime: new Date(),
      }
    );

    // 立即到账（充值通常是实时到账）
    await this.accountToWallet(recharge.orderNo);
  }

  /**
   * 支付失败回调处理
   */
  async handlePaymentFailed(orderNo: string, params: {
    failReason?: string;
    callbackData?: string;
  }): Promise<void> {
    const recharge = await this.getRechargeDetail(orderNo);

    // 检查订单状态
    if (recharge.payStatus === 2) {
      // 已经支付成功，不能改为失败
      throw new CustomException(CodeEnum.RECHARGE_ALREADY_PAID);
    }

    if (recharge.payStatus === 3) {
      // 已经是失败状态，幂等处理
      return;
    }

    // 更新订单状态
    await this.rechargeRepository.update(
      { orderNo },
      {
        payStatus: 3, // 支付失败
        failReason: params.failReason,
        callbackData: params.callbackData,
        completeTime: new Date(),
      }
    );

    // 更新当日充值失败次数
    await this.walletService.updateDailyRechargeFailCount(recharge.memberId);
  }

  /**
   * 充值到账
   */
  async accountToWallet(orderNo: string): Promise<void> {
    const recharge = await this.getRechargeDetail(orderNo);

    if (recharge.payStatus !== 2) {
      throw new CustomException(CodeEnum.RECHARGE_NOT_PAID);
    }

    if (recharge.accountStatus === 1) {
      // 已经到账，幂等处理
      return;
    }

    // 记录钱包流水
    await this.walletService.changeBalance({
      memberId: recharge.memberId,
      type: 1, // 充值
      direction: 1, // 收入
      amount: recharge.actualAmount,
      businessType: 'RECHARGE',
      businessId: recharge.id,
      businessNo: recharge.orderNo,
      description: `充值 ${recharge.amount}元，手续费 ${recharge.fee}元`,
      thirdTradeNo: recharge.thirdPayNo,
      paymentChannel: recharge.paymentChannel,
    });

    // 更新到账状态
    await this.rechargeRepository.update(
      { orderNo },
      {
        accountStatus: 1, // 已到账
        accountTime: new Date(),
      }
    );
  }

  /**
   * 取消充值订单
   */
  async cancelRecharge(orderNo: string, reason?: string): Promise<void> {
    const recharge = await this.getRechargeDetail(orderNo);

    // 检查订单状态
    if (recharge.payStatus === 2) {
      throw new CustomException(CodeEnum.RECHARGE_ALREADY_PAID);
    }

    if (recharge.payStatus === 4) {
      // 已经取消，幂等处理
      return;
    }

    // 更新订单状态
    await this.rechargeRepository.update(
      { orderNo },
      {
        payStatus: 4, // 已取消
        failReason: reason,
        cancelTime: new Date(),
      }
    );
  }

  /**
   * 重新发起充值
   */
  async retryRecharge(orderNo: string): Promise<Recharge> {
    const recharge = await this.getRechargeDetail(orderNo);

    // 检查订单状态
    if (recharge.payStatus === 2) {
      throw new CustomException(CodeEnum.RECHARGE_ALREADY_PAID);
    }

    if (recharge.payStatus === 4) {
      throw new CustomException(CodeEnum.RECHARGE_ORDER_CANCELLED);
    }

    // 重置订单状态
    await this.rechargeRepository.update(
      { orderNo },
      {
        payStatus: 0, // 待支付
        accountStatus: 0, // 未到账
        failReason: null,
        thirdPayNo: null,
        paymentChannel: null,
        callbackData: null,
      }
    );

    return await this.getRechargeDetail(orderNo);
  }

  /**
   * 充值统计
   */
  async getRechargeStatistics(params?: {
    memberId?: string;
    rechargeType?: number;
    startTime?: Date;
    endTime?: Date;
  }): Promise<any> {
    const whereCondition: any = { deleteFlag: 0, payStatus: 2 };

    if (params?.memberId) {
      whereCondition.memberId = params.memberId;
    }

    if (params?.rechargeType) {
      whereCondition.rechargeType = params.rechargeType;
    }

    if (params?.startTime && params?.endTime) {
      whereCondition.payTime = Between(params.startTime, params.endTime);
    }

    const recharges = await this.rechargeRepository.find({ where: whereCondition });

    const totalCount = recharges.length;
    const totalAmount = recharges.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalActualAmount = recharges.reduce((sum, item) => sum + Number(item.actualAmount), 0);
    const totalFee = recharges.reduce((sum, item) => sum + Number(item.fee), 0);

    // 按类型统计
    const typeStatistics = {};
    recharges.forEach(item => {
      if (!typeStatistics[item.rechargeType]) {
        typeStatistics[item.rechargeType] = {
          count: 0,
          amount: 0,
          actualAmount: 0,
          fee: 0,
        };
      }
      typeStatistics[item.rechargeType].count++;
      typeStatistics[item.rechargeType].amount += Number(item.amount);
      typeStatistics[item.rechargeType].actualAmount += Number(item.actualAmount);
      typeStatistics[item.rechargeType].fee += Number(item.fee);
    });

    return {
      totalCount,
      totalAmount,
      totalActualAmount,
      totalFee,
      typeStatistics,
    };
  }

  /**
   * 生成充值订单号
   */
  private generateRechargeOrderNo(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RC${timestamp}${random}`;
  }

  /**
   * 计算充值手续费
   */
  private calculateRechargeFee(amount: number, rechargeType: number): number {
    // 这里可以根据充值方式和金额设置不同的手续费率
    // 简化实现，实际应该从配置中读取
    const feeRates = {
      1: 0.006, // 支付宝 0.6%
      2: 0.006, // 微信 0.6%
      3: 0.005, // 银行卡 0.5%
      4: 0,     // 余额 免费
    };

    const feeRate = feeRates[rechargeType] || 0;
    const minFee = 0;
    const maxFee = 50; // 最高50元手续费

    let fee = amount * feeRate;
    fee = Math.max(fee, minFee);
    fee = Math.min(fee, maxFee);

    return Number(fee.toFixed(2));
  }
}