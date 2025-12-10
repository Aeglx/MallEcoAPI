import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { DistributionCash } from './entities/distribution-cash.entity';
import { Distribution } from './entities/distribution.entity';
import { DistributionCashApplyDto } from './dto/distribution-cash-apply.dto';
import { DistributionQueryDto } from './dto/distribution-query.dto';
import { CustomException } from '../../common/filters/custom-exception';
import { CodeEnum } from '../../common/enums/code.enum';

@Injectable()
export class DistributionCashService {
  constructor(
    @InjectRepository(DistributionCash)
    private cashRepository: Repository<DistributionCash>,
    @InjectRepository(Distribution)
    private distributionRepository: Repository<Distribution>,
  ) {}

  /**
   * 申请提现
   */
  async applyCash(distributionId: string, applyDto: DistributionCashApplyDto): Promise<DistributionCash> {
    // 检查分销员是否存在
    const distribution = await this.distributionRepository.findOne({
      where: { id: distributionId, deleteFlag: 0 }
    });
    
    if (!distribution) {
      throw new CustomException(CodeEnum.DISTRIBUTION_NOT_FOUND);
    }

    // 检查可用佣金
    if (distribution.availableCommission < applyDto.cashAmount) {
      throw new CustomException(CodeEnum.INSUFFICIENT_COMMISSION);
    }

    // 检查最低提现金额
    const minCashAmount = 10; // 可以从配置中获取
    if (applyDto.cashAmount < minCashAmount) {
      throw new CustomException(CodeEnum.MIN_CASH_AMOUNT);
    }

    // 检查是否有未处理的提现申请
    const pendingCash = await this.cashRepository.findOne({
      where: {
        distributionId,
        status: 0, // 待审核
        deleteFlag: 0
      }
    });

    if (pendingCash) {
      throw new CustomException(CodeEnum.CASH_APPLICATION_PENDING);
    }

    // 生成分销码
    const cashNo = this.generateCashNo();

    // 计算手续费
    const cashFee = this.calculateCashFee(applyDto.cashAmount);
    const actualAmount = applyDto.cashAmount - cashFee;

    // 创建提现申请
    const cash = this.cashRepository.create({
      distributionId,
      distributionCode: distribution.distributionCode,
      memberName: distribution.memberName,
      mobile: distribution.mobile,
      cashNo,
      cashAmount: applyDto.cashAmount,
      cashFee,
      actualAmount,
      cashType: applyDto.cashType,
      accountNo: applyDto.accountNo,
      accountName: applyDto.accountName,
      bankName: applyDto.bankName,
      bankBranch: applyDto.bankBranch,
      status: 0, // 待审核
      remark: applyDto.remark,
      storeId: distribution.storeId,
      storeName: distribution.storeName,
    });

    const result = await this.cashRepository.save(cash);

    // 冻结相应佣金
    await this.distributionRepository.decrement(
      { id: distributionId },
      'availableCommission',
      applyDto.cashAmount
    );
    await this.distributionRepository.increment(
      { id: distributionId },
      'frozenCommission',
      applyDto.cashAmount
    );

    return result;
  }

  /**
   * 审核提现申请
   */
  async auditCash(cashId: string, status: number, auditReason?: string, auditUserId?: string, auditUserName?: string): Promise<DistributionCash> {
    const cash = await this.cashRepository.findOne({
      where: { id: cashId, deleteFlag: 0 },
      relations: ['distribution']
    });

    if (!cash) {
      throw new CustomException(CodeEnum.CASH_NOT_FOUND);
    }

    if (cash.status !== 0) {
      throw new CustomException(CodeEnum.CASH_ALREADY_AUDITED);
    }

    // 更新审核状态
    cash.status = status;
    cash.auditReason = auditReason;
    cash.auditTime = new Date();
    cash.auditUserId = auditUserId;
    cash.auditUserName = auditUserName;

    const result = await this.cashRepository.save(cash);

    // 如果审核通过，需要处理佣金
    if (status === 1) { // 审核通过
      // 从冻结佣金中扣除，从累计提现中增加
      await this.distributionRepository.decrement(
        { id: cash.distributionId },
        'frozenCommission',
        cash.cashAmount
      );
      await this.distributionRepository.increment(
        { id: cash.distributionId },
        'totalWithdraw',
        cash.cashAmount
      );
    } else if (status === 2) { // 审核拒绝
      // 解冻佣金
      await this.distributionRepository.decrement(
        { id: cash.distributionId },
        'frozenCommission',
        cash.cashAmount
      );
      await this.distributionRepository.increment(
        { id: cash.distributionId },
        'availableCommission',
        cash.cashAmount
      );
    }

    return result;
  }

  /**
   * 处理提现
   */
  async processCash(cashId: string, transactionNo: string, processUserId?: string, processUserName?: string): Promise<DistributionCash> {
    const cash = await this.cashRepository.findOne({
      where: { id: cashId, deleteFlag: 0 }
    });

    if (!cash) {
      throw new CustomException(CodeEnum.CASH_NOT_FOUND);
    }

    if (cash.status !== 1) {
      throw new CustomException(CodeEnum.CASH_NOT_APPROVED);
    }

    cash.status = 4; // 已完成
    cash.processTime = new Date();
    cash.processUserId = processUserId;
    cash.processUserName = processUserName;
    cash.transactionNo = transactionNo;

    return await this.cashRepository.save(cash);
  }

  /**
   * 获取提现记录列表
   */
  async getCashRecords(distributionId: string, queryDto: DistributionQueryDto): Promise<{ items: DistributionCash[]; total: number }> {
    const { page = 1, limit = 20, startTime, endTime, sortBy = 'create_time', sortOrder = 'DESC' } = queryDto;

    const whereCondition: any = { 
      distributionId, 
      deleteFlag: 0 
    };

    if (startTime && endTime) {
      whereCondition.createTime = Between(new Date(startTime), new Date(endTime));
    }

    const [items, total] = await this.cashRepository.findAndCount({
      where: whereCondition,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 获取提现详情
   */
  async getCashDetail(id: string): Promise<DistributionCash> {
    const cash = await this.cashRepository.findOne({
      where: { id, deleteFlag: 0 },
      relations: ['distribution'],
    });

    if (!cash) {
      throw new CustomException(CodeEnum.CASH_NOT_FOUND);
    }

    return cash;
  }

  /**
   * 生成分销码
   */
  private generateCashNo(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CASH${timestamp}${random}`;
  }

  /**
   * 计算提现手续费
   */
  private calculateCashFee(amount: number): number {
    // 可以从配置中获取费率
    const feeRate = 0.003; // 0.3%
    const minFee = 2; // 最低2元
    const maxFee = 50; // 最高50元

    const fee = amount * feeRate;
    return Math.max(minFee, Math.min(maxFee, fee));
  }

  /**
   * 获取提现统计
   */
  async getCashStatistics(distributionId: string, period?: string): Promise<{
    totalAmount: number;
    totalFee: number;
    actualAmount: number;
    pendingCount: number;
    processingCount: number;
    completedCount: number;
  }> {
    const whereCondition: any = { 
      distributionId, 
      deleteFlag: 0 
    };

    if (period) {
      const now = new Date();
      let startTime: Date;
      
      switch (period) {
        case 'today':
          startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startTime = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      whereCondition.createTime = Between(startTime, now);
    }

    const [totalResult, statusResult] = await Promise.all([
      this.cashRepository
        .createQueryBuilder('cash')
        .select('SUM(cash.cashAmount)', 'totalAmount')
        .addSelect('SUM(cash.cashFee)', 'totalFee')
        .addSelect('SUM(cash.actualAmount)', 'actualAmount')
        .where(whereCondition)
        .getRawOne(),
      
      this.cashRepository
        .createQueryBuilder('cash')
        .select('cash.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where(whereCondition)
        .groupBy('cash.status')
        .getRawMany(),
    ]);

    const statistics = {
      totalAmount: parseFloat(totalResult.totalAmount) || 0,
      totalFee: parseFloat(totalResult.totalFee) || 0,
      actualAmount: parseFloat(totalResult.actualAmount) || 0,
      pendingCount: 0,
      processingCount: 0,
      completedCount: 0,
    };

    statusResult.forEach(item => {
      switch (item.status) {
        case 0: // 待审核
        case 3: // 处理中
          if (item.status === 0) statistics.pendingCount = parseInt(item.count);
          else statistics.processingCount = parseInt(item.count);
          break;
        case 4: // 已完成
          statistics.completedCount = parseInt(item.count);
          break;
      }
    });

    return statistics;
  }
}