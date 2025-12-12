import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DistributionCash } from '../entities/distribution-cash.entity';
import { Distribution } from '../entities/distribution.entity';
import { CustomException } from '../../filters/custom-exception';
import { CodeEnum } from '../../enums/code.enum';

@Injectable()
export class DistributionCashService {
  constructor(
    @InjectRepository(DistributionCash)
    private readonly distributionCashRepository: Repository<DistributionCash>,
    @InjectRepository(Distribution)
    private readonly distributionRepository: Repository<Distribution>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 申请提现
   */
  async applyCash(data: {
    distributionId: string;
    cashAmount: number;
    cashMethod: 'alipay' | 'wechat' | 'bank';
    accountNo: string;
    accountName: string;
    bankName?: string;
    bankBranch?: string;
    mobile?: string;
  }): Promise<DistributionCash> {
    // 验证分销�?
    const distribution = await this.distributionRepository.findOne({
      where: { id: data.distributionId, status: 'approved' },
    });
    if (!distribution) {
      throw new CustomException(CodeEnum.DISTRIBUTION_NOT_FOUND);
    }

    // 检查可用佣金
    if (distribution.availableCommission < data.cashAmount) {
      throw new CustomException(CodeEnum.INSUFFICIENT_COMMISSION);
    }

    // 检查最低提现金额
    const minCashAmount = 100; // 可以配置
    if (data.cashAmount < minCashAmount) {
      throw new CustomException(CodeEnum.MIN_CASH_AMOUNT);
    }

    // 检查是否有待处理的提现申请
    const pendingCash = await this.distributionCashRepository.findOne({
      where: {
        distributionId: data.distributionId,
        status: 'pending',
      },
    });
    if (pendingCash) {
      throw new CustomException(CodeEnum.CASH_APPLICATION_PENDING);
    }

    // 计算手续�?
    const feeAmount = this.calculateFee(data.cashAmount, data.cashMethod);
    const actualAmount = data.cashAmount - feeAmount;

    return await this.dataSource.transaction(async manager => {
      // 创建提现记录
      const cash = manager.create(DistributionCash, {
        distributionId: data.distributionId,
        cashNo: `CASH${Date.now()}`, // 临时生成提现单号
        cashAmount: data.cashAmount,
        feeAmount,
        actualAmount,
        cashMethod: data.cashMethod,
        accountNo: data.accountNo,
        accountName: data.accountName,
        bankName: data.bankName,
        bankBranch: data.bankBranch,
        mobile: data.mobile,
        status: 'pending',
      });

      const savedCash = await manager.save(cash);

      // 冻结佣金
      await manager.decrement(
        Distribution,
        { id: data.distributionId },
        'availableCommission',
        data.cashAmount,
      );
      await manager.increment(
        Distribution,
        { id: data.distributionId },
        'frozenCommission',
        data.cashAmount,
      );

      return savedCash;
    });
  }

  /**
   * 计算手续�?
   */
  private calculateFee(amount: number, method: string): number {
    // 手续费配置可以放入数据库或配置文�?
    const feeRates = {
      alipay: 0.006,  // 0.6%
      wechat: 0.006,  // 0.6%
      bank: 0.002,    // 0.2%
    };

    const feeAmount = amount * (feeRates[method] || 0.006);
    return Math.round(feeAmount * 100) / 100;
  }

  /**
   * 审核提现申请
   */
  async auditCash(
    id: string,
    auditUserId: string,
    status: 'processing' | 'rejected',
    remark?: string,
  ): Promise<DistributionCash> {
    const cash = await this.distributionCashRepository.findOne({
      where: { id },
    });
    if (!cash) {
      throw new CustomException(CodeEnum.CASH_NOT_FOUND);
    }

    if (cash.status !== 'pending') {
      throw new CustomException(CodeEnum.CASH_ALREADY_AUDITED);
    }

    return await this.dataSource.transaction(async manager => {
      // 更新提现记录
      cash.status = status;
      cash.auditTime = new Date();
      cash.auditUserId = auditUserId;
      cash.auditRemark = remark;

      if (status === 'rejected') {
        // 拒绝提现，解冻佣�?
        await manager.increment(
          Distribution,
          { id: cash.distributionId },
          'availableCommission',
          cash.cashAmount,
        );
        await manager.decrement(
          Distribution,
          { id: cash.distributionId },
          'frozenCommission',
          cash.cashAmount,
        );
        cash.rejectReason = remark;
      } else if (status === 'processing') {
        cash.processTime = new Date();
        cash.processUserId = auditUserId;
      }

      return await manager.save(cash);
    });
  }

  /**
   * 完成提现
   */
  async completeCash(
    id: string,
    transactionNo: string,
    processUserId: string,
  ): Promise<DistributionCash> {
    const cash = await this.distributionCashRepository.findOne({
      where: { id },
    });
    if (!cash) {
      throw new CustomException(CodeEnum.CASH_NOT_FOUND);
    }

    if (cash.status !== 'processing') {
      throw new CustomException(CodeEnum.CASH_NOT_APPROVED);
    }

    return await this.dataSource.transaction(async manager => {
      // 更新提现记录
      cash.status = 'completed';
      cash.transactionNo = transactionNo;
      cash.completeTime = new Date();
      cash.processUserId = processUserId;

      // 解冻并扣减佣�?
      await manager.decrement(
        Distribution,
        { id: cash.distributionId },
        'frozenCommission',
        cash.cashAmount,
      );

      return await manager.save(cash);
    });
  }

  /**
   * 取消提现申请
   */
  async cancelCash(id: string, distributionId: string, reason?: string): Promise<DistributionCash> {
    const cash = await this.distributionCashRepository.findOne({
      where: { id, distributionId },
    });
    if (!cash) {
      throw new CustomException(CodeEnum.CASH_NOT_FOUND);
    }

    if (cash.status !== 'pending') {
      throw new CustomException(CodeEnum.SYSTEM_ERROR);
    }

    return await this.dataSource.transaction(async manager => {
      // 更新提现记录
      cash.status = 'cancelled';
      cash.cancelReason = reason;

      // 解冻佣金
      await manager.increment(
        Distribution,
        { id: cash.distributionId },
        'availableCommission',
        cash.cashAmount,
      );
      await manager.decrement(
        Distribution,
        { id: cash.distributionId },
        'frozenCommission',
        cash.cashAmount,
      );

      return await manager.save(cash);
    });
  }

  /**
   * 获取提现记录详情
   */
  async getCashById(id: string): Promise<DistributionCash> {
    const cash = await this.distributionCashRepository.findOne({
      where: { id },
      relations: ['distribution', 'distribution.member'],
    });
    if (!cash) {
      throw new CustomException(CodeEnum.CASH_NOT_FOUND);
    }

    return cash;
  }

  /**
   * 获取分销员的提现记录列表
   */
  async getCashListByDistributionId(
    distributionId: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<[DistributionCash[], number]> {
    const queryBuilder = this.distributionCashRepository
      .createQueryBuilder('cash')
      .where('cash.distributionId = :distributionId', { distributionId });

    if (status) {
      queryBuilder.andWhere('cash.status = :status', { status });
    }

    queryBuilder
      .orderBy('cash.createTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  /**
   * 获取所有提现记录列表（管理员）
   */
  async getCashList(
    page: number = 1,
    limit: number = 10,
    status?: string,
    cashMethod?: string,
    startTime?: Date,
    endTime?: Date,
  ): Promise<[DistributionCash[], number]> {
    const queryBuilder = this.distributionCashRepository
      .createQueryBuilder('cash')
      .leftJoinAndSelect('cash.distribution', 'distribution')
      .leftJoinAndSelect('distribution.member', 'member');

    if (status) {
      queryBuilder.andWhere('cash.status = :status', { status });
    }

    if (cashMethod) {
      queryBuilder.andWhere('cash.cashMethod = :cashMethod', { cashMethod });
    }

    if (startTime) {
      queryBuilder.andWhere('cash.createTime >= :startTime', { startTime });
    }

    if (endTime) {
      queryBuilder.andWhere('cash.createTime <= :endTime', { endTime });
    }

    queryBuilder
      .orderBy('cash.createTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  /**
   * 获取提现统计
   */
  async getCashStats(distributionId?: string): Promise<{
    totalCount: number;
    totalAmount: number;
    totalFee: number;
    totalActualAmount: number;
    pendingCount: number;
    pendingAmount: number;
    processingCount: number;
    processingAmount: number;
    completedCount: number;
    completedAmount: number;
    rejectedCount: number;
    rejectedAmount: number;
  }> {
    const queryBuilder = this.distributionCashRepository
      .createQueryBuilder('cash')
      .select([
        'COUNT(*) as totalCount',
        'SUM(cash.cashAmount) as totalAmount',
        'SUM(cash.feeAmount) as totalFee',
        'SUM(cash.actualAmount) as totalActualAmount',
        'SUM(CASE WHEN cash.status = "pending" THEN 1 ELSE 0 END) as pendingCount',
        'SUM(CASE WHEN cash.status = "pending" THEN cash.cashAmount ELSE 0 END) as pendingAmount',
        'SUM(CASE WHEN cash.status = "processing" THEN 1 ELSE 0 END) as processingCount',
        'SUM(CASE WHEN cash.status = "processing" THEN cash.cashAmount ELSE 0 END) as processingAmount',
        'SUM(CASE WHEN cash.status = "completed" THEN 1 ELSE 0 END) as completedCount',
        'SUM(CASE WHEN cash.status = "completed" THEN cash.cashAmount ELSE 0 END) as completedAmount',
        'SUM(CASE WHEN cash.status = "rejected" THEN 1 ELSE 0 END) as rejectedCount',
        'SUM(CASE WHEN cash.status = "rejected" THEN cash.cashAmount ELSE 0 END) as rejectedAmount',
      ]);

    if (distributionId) {
      queryBuilder.andWhere('cash.distributionId = :distributionId', { distributionId });
    }

    const result = await queryBuilder.getRawOne();

    return {
      totalCount: parseInt(result.totalCount) || 0,
      totalAmount: parseFloat(result.totalAmount) || 0,
      totalFee: parseFloat(result.totalFee) || 0,
      totalActualAmount: parseFloat(result.totalActualAmount) || 0,
      pendingCount: parseInt(result.pendingCount) || 0,
      pendingAmount: parseFloat(result.pendingAmount) || 0,
      processingCount: parseInt(result.processingCount) || 0,
      processingAmount: parseFloat(result.processingAmount) || 0,
      completedCount: parseInt(result.completedCount) || 0,
      completedAmount: parseFloat(result.completedAmount) || 0,
      rejectedCount: parseInt(result.rejectedCount) || 0,
      rejectedAmount: parseFloat(result.rejectedAmount) || 0,
    };
  }

  /**
   * 批量审核提现申请
   */
  async batchAuditCash(
    ids: string[],
    status: 'processing' | 'rejected',
    auditUserId: string,
    remark?: string,
  ): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const cashes = await manager.findByIds(DistributionCash, ids);

      for (const cash of cashes) {
        if (cash.status !== 'pending') {
          continue;
        }

        cash.status = status;
        cash.auditTime = new Date();
        cash.auditUserId = auditUserId;
        cash.auditRemark = remark;

        if (status === 'rejected') {
          // 拒绝提现，解冻佣�?
          await manager.increment(
            Distribution,
            { id: cash.distributionId },
            'availableCommission',
            cash.cashAmount,
          );
          await manager.decrement(
            Distribution,
            { id: cash.distributionId },
            'frozenCommission',
            cash.cashAmount,
          );
          cash.rejectReason = remark;
        } else if (status === 'processing') {
          cash.processTime = new Date();
          cash.processUserId = auditUserId;
        }

        await manager.save(cash);
      }
    });
  }
}
