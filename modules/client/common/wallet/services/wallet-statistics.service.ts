import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { WalletRecord } from '../entities/wallet-record.entity';
import { Recharge } from '../entities/recharge.entity';
import { Withdraw } from '../entities/withdraw.entity';
import { Points, PointsRecord } from '../entities/points.entity';

@Injectable()
export class WalletStatisticsService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletRecord)
    private walletRecordRepository: Repository<WalletRecord>,
    @InjectRepository(Recharge)
    private rechargeRepository: Repository<Recharge>,
    @InjectRepository(Withdraw)
    private withdrawRepository: Repository<Withdraw>,
    @InjectRepository(Points)
    private pointsRepository: Repository<Points>,
    @InjectRepository(PointsRecord)
    private pointsRecordRepository: Repository<PointsRecord>,
  ) {}

  /**
   * 钱包总览统计
   */
  async getWalletOverview(params?: {
    startTime?: Date;
    endTime?: Date;
  }): Promise<any> {
    const { startTime, endTime } = params || {};

    // 基础统计
    const totalWallets = await this.walletRepository.count({
      where: { deleteFlag: 0 }
    });

    const walletSum = await this.walletRepository
      .createQueryBuilder('wallet')
      .select('COUNT(*)', 'totalCount')
      .addSelect('SUM(wallet.balance)', 'totalBalance')
      .addSelect('SUM(wallet.frozenBalance)', 'totalFrozenBalance')
      .addSelect('SUM(wallet.totalRecharge)', 'totalRecharge')
      .addSelect('SUM(wallet.totalWithdraw)', 'totalWithdraw')
      .addSelect('SUM(wallet.totalConsume)', 'totalConsume')
      .addSelect('SUM(wallet.totalCommission)', 'totalCommission')
      .where('wallet.deleteFlag = :deleteFlag', { deleteFlag: 0 })
      .getRawOne();

    // 充值统计
    const rechargeWhere: any = { deleteFlag: 0, payStatus: 2 };
    if (startTime && endTime) {
      rechargeWhere.payTime = Between(startTime, endTime);
    }

    const rechargeStats = await this.rechargeRepository
      .createQueryBuilder('recharge')
      .select('COUNT(*)', 'totalCount')
      .addSelect('SUM(recharge.amount)', 'totalAmount')
      .addSelect('SUM(recharge.actualAmount)', 'totalActualAmount')
      .addSelect('SUM(recharge.fee)', 'totalFee')
      .where(rechargeWhere)
      .getRawOne();

    // 提现统计
    const withdrawWhere: any = { deleteFlag: 0, auditStatus: 1 };
    if (startTime && endTime) {
      withdrawWhere.applyTime = Between(startTime, endTime);
    }

    const withdrawStats = await this.withdrawRepository
      .createQueryBuilder('withdraw')
      .select('COUNT(*)', 'totalCount')
      .addSelect('SUM(withdraw.amount)', 'totalAmount')
      .addSelect('SUM(withdraw.actualAmount)', 'totalActualAmount')
      .addSelect('SUM(withdraw.fee)', 'totalFee')
      .addSelect('SUM(withdraw.taxAmount)', 'totalTaxAmount')
      .where(withdrawWhere)
      .getRawOne();

    // 积分统计
    const pointsSum = await this.pointsRepository
      .createQueryBuilder('points')
      .select('COUNT(*)', 'totalCount')
      .addSelect('SUM(points.balance)', 'totalBalance')
      .addSelect('SUM(points.totalEarned)', 'totalEarned')
      .addSelect('SUM(points.totalSpent)', 'totalSpent')
      .addSelect('SUM(points.totalExpired)', 'totalExpired')
      .where('points.deleteFlag = :deleteFlag', { deleteFlag: 0 })
      .getRawOne();

    return {
      // 钱包概览
      totalWallets: parseInt(walletSum?.totalCount) || 0,
      totalBalance: Number(walletSum?.totalBalance) || 0,
      totalFrozenBalance: Number(walletSum?.totalFrozenBalance) || 0,
      totalRecharge: Number(walletSum?.totalRecharge) || 0,
      totalWithdraw: Number(walletSum?.totalWithdraw) || 0,
      totalConsume: Number(walletSum?.totalConsume) || 0,
      totalCommission: Number(walletSum?.totalCommission) || 0,

      // 充值统计
      recharge: {
        totalCount: parseInt(rechargeStats?.totalCount) || 0,
        totalAmount: Number(rechargeStats?.totalAmount) || 0,
        totalActualAmount: Number(rechargeStats?.totalActualAmount) || 0,
        totalFee: Number(rechargeStats?.totalFee) || 0,
      },

      // 提现统计
      withdraw: {
        totalCount: parseInt(withdrawStats?.totalCount) || 0,
        totalAmount: Number(withdrawStats?.totalAmount) || 0,
        totalActualAmount: Number(withdrawStats?.totalActualAmount) || 0,
        totalFee: Number(withdrawStats?.totalFee) || 0,
        totalTaxAmount: Number(withdrawStats?.totalTaxAmount) || 0,
      },

      // 积分概览
      points: {
        totalCount: parseInt(pointsSum?.totalCount) || 0,
        totalBalance: Number(pointsSum?.totalBalance) || 0,
        totalEarned: Number(pointsSum?.totalEarned) || 0,
        totalSpent: Number(pointsSum?.totalSpent) || 0,
        totalExpired: Number(pointsSum?.totalExpired) || 0,
      },
    };
  }

  /**
   * 钱包流水统计
   */
  async getWalletRecordStatistics(params: {
    memberId?: string;
    type?: number;
    direction?: number;
    startTime?: Date;
    endTime?: Date;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<any> {
    const { memberId, type, direction, startTime, endTime, groupBy = 'day' } = params;

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

    // 基础统计
    const baseStats = await this.walletRecordRepository
      .createQueryBuilder('record')
      .select('COUNT(*)', 'totalCount')
      .addSelect('SUM(CASE WHEN record.direction = 1 THEN record.amount ELSE 0 END)', 'totalIncome')
      .addSelect('SUM(CASE WHEN record.direction = 2 THEN record.amount ELSE 0 END)', 'totalExpense')
      .where(whereCondition)
      .getRawOne();

    // 按类型统计
    const typeStats = await this.walletRecordRepository
      .createQueryBuilder('record')
      .select('record.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(record.amount)', 'totalAmount')
      .where(whereCondition)
      .groupBy('record.type')
      .getRawMany();

    // 按时间分组统计
    let timeGroupStats = [];
    if (startTime && endTime) {
      timeGroupStats = await this.getTimeGroupStatistics(
        'wallet_record',
        whereCondition,
        groupBy,
        'amount'
      );
    }

    return {
      // 基础统计
      totalCount: parseInt(baseStats?.totalCount) || 0,
      totalIncome: Number(baseStats?.totalIncome) || 0,
      totalExpense: Number(baseStats?.totalExpense) || 0,
      netAmount: (Number(baseStats?.totalIncome) || 0) - (Number(baseStats?.totalExpense) || 0),

      // 按类型统计
      typeStatistics: typeStats.map(item => ({
        type: parseInt(item.type),
        count: parseInt(item.count),
        totalAmount: Number(item.totalAmount),
      })),

      // 按时间统计
      timeStatistics: timeGroupStats,
    };
  }

  /**
   * 充值统计报表
   */
  async getRechargeStatistics(params: {
    rechargeType?: number;
    startTime?: Date;
    endTime?: Date;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<any> {
    const { rechargeType, startTime, endTime, groupBy = 'day' } = params;

    const whereCondition: any = { deleteFlag: 0, payStatus: 2 };
    if (rechargeType) {
      whereCondition.rechargeType = rechargeType;
    }
    if (startTime && endTime) {
      whereCondition.payTime = Between(startTime, endTime);
    }

    // 基础统计
    const baseStats = await this.rechargeRepository
      .createQueryBuilder('recharge')
      .select('COUNT(*)', 'totalCount')
      .addSelect('SUM(recharge.amount)', 'totalAmount')
      .addSelect('SUM(recharge.actualAmount)', 'totalActualAmount')
      .addSelect('SUM(recharge.fee)', 'totalFee')
      .addSelect('AVG(recharge.amount)', 'avgAmount')
      .addSelect('MAX(recharge.amount)', 'maxAmount')
      .addSelect('MIN(recharge.amount)', 'minAmount')
      .where(whereCondition)
      .getRawOne();

    // 按类型统计
    const typeStats = await this.rechargeRepository
      .createQueryBuilder('recharge')
      .select('recharge.rechargeType', 'rechargeType')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(recharge.amount)', 'totalAmount')
      .addSelect('AVG(recharge.amount)', 'avgAmount')
      .where(whereCondition)
      .groupBy('recharge.rechargeType')
      .getRawMany();

    // 按时间分组统计
    let timeGroupStats = [];
    if (startTime && endTime) {
      timeGroupStats = await this.getTimeGroupStatistics(
        'recharge',
        whereCondition,
        groupBy,
        'amount'
      );
    }

    return {
      // 基础统计
      totalCount: parseInt(baseStats?.totalCount) || 0,
      totalAmount: Number(baseStats?.totalAmount) || 0,
      totalActualAmount: Number(baseStats?.totalActualAmount) || 0,
      totalFee: Number(baseStats?.totalFee) || 0,
      avgAmount: Number(baseStats?.avgAmount) || 0,
      maxAmount: Number(baseStats?.maxAmount) || 0,
      minAmount: Number(baseStats?.minAmount) || 0,

      // 按类型统计
      typeStatistics: typeStats.map(item => ({
        rechargeType: parseInt(item.rechargeType),
        count: parseInt(item.count),
        totalAmount: Number(item.totalAmount),
        avgAmount: Number(item.avgAmount),
      })),

      // 按时间统计
      timeStatistics: timeGroupStats,
    };
  }

  /**
   * 提现统计报表
   */
  async getWithdrawStatistics(params: {
    withdrawType?: number;
    auditStatus?: number;
    startTime?: Date;
    endTime?: Date;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<any> {
    const { withdrawType, auditStatus, startTime, endTime, groupBy = 'day' } = params;

    const whereCondition: any = { deleteFlag: 0 };
    if (withdrawType) {
      whereCondition.withdrawType = withdrawType;
    }
    if (auditStatus !== undefined) {
      whereCondition.auditStatus = auditStatus;
    }
    if (startTime && endTime) {
      whereCondition.applyTime = Between(startTime, endTime);
    }

    // 基础统计
    const baseStats = await this.withdrawRepository
      .createQueryBuilder('withdraw')
      .select('COUNT(*)', 'totalCount')
      .addSelect('SUM(withdraw.amount)', 'totalAmount')
      .addSelect('SUM(withdraw.actualAmount)', 'totalActualAmount')
      .addSelect('SUM(withdraw.fee)', 'totalFee')
      .addSelect('SUM(withdraw.taxAmount)', 'totalTaxAmount')
      .addSelect('AVG(withdraw.amount)', 'avgAmount')
      .where(whereCondition)
      .getRawOne();

    // 按类型统计
    const typeStats = await this.withdrawRepository
      .createQueryBuilder('withdraw')
      .select('withdraw.withdrawType', 'withdrawType')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(withdraw.amount)', 'totalAmount')
      .addSelect('AVG(withdraw.amount)', 'avgAmount')
      .where(whereCondition)
      .groupBy('withdraw.withdrawType')
      .getRawMany();

    // 按审核状态统计
    const auditStats = await this.withdrawRepository
      .createQueryBuilder('withdraw')
      .select('withdraw.auditStatus', 'auditStatus')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(withdraw.amount)', 'totalAmount')
      .where(whereCondition)
      .groupBy('withdraw.auditStatus')
      .getRawMany();

    // 按时间分组统计
    let timeGroupStats = [];
    if (startTime && endTime) {
      timeGroupStats = await this.getTimeGroupStatistics(
        'withdraw',
        whereCondition,
        groupBy,
        'amount'
      );
    }

    return {
      // 基础统计
      totalCount: parseInt(baseStats?.totalCount) || 0,
      totalAmount: Number(baseStats?.totalAmount) || 0,
      totalActualAmount: Number(baseStats?.totalActualAmount) || 0,
      totalFee: Number(baseStats?.totalFee) || 0,
      totalTaxAmount: Number(baseStats?.totalTaxAmount) || 0,
      avgAmount: Number(baseStats?.avgAmount) || 0,

      // 按类型统计
      typeStatistics: typeStats.map(item => ({
        withdrawType: parseInt(item.withdrawType),
        count: parseInt(item.count),
        totalAmount: Number(item.totalAmount),
        avgAmount: Number(item.avgAmount),
      })),

      // 按审核状态统计
      auditStatistics: auditStats.map(item => ({
        auditStatus: parseInt(item.auditStatus),
        count: parseInt(item.count),
        totalAmount: Number(item.totalAmount),
      })),

      // 按时间统计
      timeStatistics: timeGroupStats,
    };
  }

  /**
   * 积分统计报表
   */
  async getPointsStatistics(params: {
    memberId?: string;
    type?: number;
    direction?: number;
    startTime?: Date;
    endTime?: Date;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<any> {
    const { memberId, type, direction, startTime, endTime, groupBy = 'day' } = params;

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

    // 基础统计
    const baseStats = await this.pointsRecordRepository
      .createQueryBuilder('record')
      .select('COUNT(*)', 'totalCount')
      .addSelect('SUM(CASE WHEN record.direction = 1 THEN record.points ELSE 0 END)', 'totalEarned')
      .addSelect('SUM(CASE WHEN record.direction = 2 THEN record.points ELSE 0 END)', 'totalSpent')
      .addSelect('AVG(CASE WHEN record.direction = 1 THEN record.points ELSE 0 END)', 'avgEarned')
      .where(whereCondition)
      .getRawOne();

    // 按类型统计
    const typeStats = await this.pointsRecordRepository
      .createQueryBuilder('record')
      .select('record.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(record.points)', 'totalPoints')
      .where(whereCondition)
      .groupBy('record.type')
      .getRawMany();

    // 按时间分组统计
    let timeGroupStats = [];
    if (startTime && endTime) {
      timeGroupStats = await this.getTimeGroupStatistics(
        'points_record',
        whereCondition,
        groupBy,
        'points'
      );
    }

    return {
      // 基础统计
      totalCount: parseInt(baseStats?.totalCount) || 0,
      totalEarned: Number(baseStats?.totalEarned) || 0,
      totalSpent: Number(baseStats?.totalSpent) || 0,
      netPoints: (Number(baseStats?.totalEarned) || 0) - (Number(baseStats?.totalSpent) || 0),
      avgEarned: Number(baseStats?.avgEarned) || 0,

      // 按类型统计
      typeStatistics: typeStats.map(item => ({
        type: parseInt(item.type),
        count: parseInt(item.count),
        totalPoints: Number(item.totalPoints),
      })),

      // 按时间统计
      timeStatistics: timeGroupStats,
    };
  }

  /**
   * 账务对账
   */
  async reconcileAccounts(params: {
    startDate: Date;
    endDate: Date;
  }): Promise<any> {
    const { startDate, endDate } = params;

    // 充值对账
    const rechargeReconciliation = await this.rechargeRepository
      .createQueryBuilder('recharge')
      .select('recharge.paymentChannel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(recharge.amount)', 'systemAmount')
      .addSelect('SUM(recharge.actualAmount)', 'actualAmount')
      .where('recharge.deleteFlag = :deleteFlag AND recharge.payStatus = :payStatus AND recharge.payTime BETWEEN :startDate AND :endDate', {
        deleteFlag: 0,
        payStatus: 2,
        startDate,
        endDate,
      })
      .groupBy('recharge.paymentChannel')
      .getRawMany();

    // 提现对账
    const withdrawReconciliation = await this.withdrawRepository
      .createQueryBuilder('withdraw')
      .select('withdraw.paymentChannel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(withdraw.amount)', 'systemAmount')
      .addSelect('SUM(withdraw.actualAmount)', 'actualAmount')
      .where('withdraw.deleteFlag = :deleteFlag AND withdraw.auditStatus = :auditStatus AND withdraw.paymentTime BETWEEN :startDate AND :endDate', {
        deleteFlag: 0,
        auditStatus: 1,
        startDate,
        endDate,
      })
      .groupBy('withdraw.paymentChannel')
      .getRawMany();

    // 第三方对账（这里应该调用第三方接口获取实际数据）
    const thirdPartyReconciliation = {
      // 调用支付宝对账接口
      alipay: await this.getThirdPartyReconciliation('alipay', startDate, endDate),
      // 调用微信对账接口
      wechat: await this.getThirdPartyReconciliation('wechat', startDate, endDate),
    };

    return {
      period: { startDate, endDate },
      recharge: {
        systemData: rechargeReconciliation,
        thirdPartyData: thirdPartyReconciliation.alipay,
        difference: this.calculateReconciliationDifference(rechargeReconciliation, thirdPartyReconciliation.alipay),
      },
      withdraw: {
        systemData: withdrawReconciliation,
        thirdPartyData: thirdPartyReconciliation.wechat,
        difference: this.calculateReconciliationDifference(withdrawReconciliation, thirdPartyReconciliation.wechat),
      },
    };
  }

  /**
   * 导出统计报表
   */
  async exportStatisticsReport(params: {
    reportType: 'wallet' | 'recharge' | 'withdraw' | 'points';
    format: 'excel' | 'csv';
    startTime: Date;
    endTime: Date;
    filters?: any;
  }): Promise<string> {
    const { reportType, format, startTime, endTime, filters } = params;

    let data = [];
    let filename = '';

    switch (reportType) {
      case 'wallet':
        data = await this.getWalletReportData(startTime, endTime, filters);
        filename = `钱包流水报表_${this.formatDate(startTime)}_${this.formatDate(endTime)}`;
        break;
      case 'recharge':
        data = await this.getRechargeReportData(startTime, endTime, filters);
        filename = `充值报表_${this.formatDate(startTime)}_${this.formatDate(endTime)}`;
        break;
      case 'withdraw':
        data = await this.getWithdrawReportData(startTime, endTime, filters);
        filename = `提现报表_${this.formatDate(startTime)}_${this.formatDate(endTime)}`;
        break;
      case 'points':
        data = await this.getPointsReportData(startTime, endTime, filters);
        filename = `积分报表_${this.formatDate(startTime)}_${this.formatDate(endTime)}`;
        break;
    }

    // 这里应该实现实际的Excel/CSV导出逻辑
    // 简化实现，返回文件路径
    const filePath = `/exports/${filename}.${format}`;
    
    // 实际导出逻辑...
    
    return filePath;
  }

  /**
   * 按时间分组统计
   */
  private async getTimeGroupStatistics(
    table: string,
    whereCondition: any,
    groupBy: string,
    amountField: string
  ): Promise<any[]> {
    let dateFormat: string;
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
    }

    // 这里应该使用原生SQL查询，因为TypeORM的日期格式化支持有限
    // 简化实现，返回空数组
    return [];
  }

  /**
   * 获取第三方对账数据
   */
  private async getThirdPartyReconciliation(channel: string, startDate: Date, endDate: Date): Promise<any> {
    // 这里应该调用第三方支付对账接口
    // 简化实现，返回模拟数据
    return {
      totalCount: 0,
      totalAmount: 0,
      details: [],
    };
  }

  /**
   * 计算对账差异
   */
  private calculateReconciliationDifference(systemData: any[], thirdPartyData: any): any {
    // 简化实现，实际应该按渠道逐项对比
    return {
      totalDifference: 0,
      channelDifferences: [],
    };
  }

  /**
   * 获取钱包报表数据
   */
  private async getWalletReportData(startDate: Date, endDate: Date, filters: any): Promise<any[]> {
    const whereCondition: any = {
      deleteFlag: 0,
      createTime: Between(startDate, endDate),
      ...filters,
    };

    return await this.walletRecordRepository.find({
      where: whereCondition,
      order: { createTime: 'DESC' },
    });
  }

  /**
   * 获取充值报表数据
   */
  private async getRechargeReportData(startDate: Date, endDate: Date, filters: any): Promise<any[]> {
    const whereCondition: any = {
      deleteFlag: 0,
      payTime: Between(startDate, endDate),
      ...filters,
    };

    return await this.rechargeRepository.find({
      where: whereCondition,
      order: { payTime: 'DESC' },
    });
  }

  /**
   * 获取提现报表数据
   */
  private async getWithdrawReportData(startDate: Date, endDate: Date, filters: any): Promise<any[]> {
    const whereCondition: any = {
      deleteFlag: 0,
      applyTime: Between(startDate, endDate),
      ...filters,
    };

    return await this.withdrawRepository.find({
      where: whereCondition,
      order: { applyTime: 'DESC' },
    });
  }

  /**
   * 获取积分报表数据
   */
  private async getPointsReportData(startDate: Date, endDate: Date, filters: any): Promise<any[]> {
    const whereCondition: any = {
      deleteFlag: 0,
      createTime: Between(startDate, endDate),
      ...filters,
    };

    return await this.pointsRecordRepository.find({
      where: whereCondition,
      order: { createTime: 'DESC' },
    });
  }

  /**
   * 格式化日期
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }
}