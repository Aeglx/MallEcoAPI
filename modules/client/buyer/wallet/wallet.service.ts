import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { 
  WalletEntity, 
  WalletTransactionEntity, 
  RechargeOrderEntity, 
  WithdrawOrderEntity,
  PointsProductEntity,
  PointsExchangeEntity 
} from './entities';
import { CreateRechargeOrderDto } from './dto/create-recharge-order.dto';
import { CreateWithdrawOrderDto } from './dto/create-withdraw-order.dto';
import { PointsExchangeDto } from './dto/points-exchange.dto';
import { WalletSearchDto } from './dto/wallet-search.dto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    @InjectRepository(WalletTransactionEntity)
    private readonly transactionRepository: Repository<WalletTransactionEntity>,
    @InjectRepository(RechargeOrderEntity)
    private readonly rechargeOrderRepository: Repository<RechargeOrderEntity>,
    @InjectRepository(WithdrawOrderEntity)
    private readonly withdrawOrderRepository: Repository<WithdrawOrderEntity>,
    @InjectRepository(PointsProductEntity)
    private readonly pointsProductRepository: Repository<PointsProductEntity>,
    @InjectRepository(PointsExchangeEntity)
    private readonly pointsExchangeRepository: Repository<PointsExchangeEntity>,
  ) {}

  /**
   * 获取用户钱包信息
   */
  async getUserWallet(userId: string) {
    const wallet = await this.walletRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!wallet) {
      // 如果钱包不存在，创建新钱包
      const newWallet = this.walletRepository.create({
        userId,
        balance: 0,
        frozenAmount: 0,
        points: 0,
        status: 'active',
      });
      return await this.walletRepository.save(newWallet);
    }

    return wallet;
  }

  /**
   * 创建充值订单
   */
  async createRechargeOrder(createRechargeDto: CreateRechargeOrderDto) {
    const { userId, amount, paymentMethod } = createRechargeDto;

    // 创建充值订单
    const rechargeOrder = this.rechargeOrderRepository.create({
      userId,
      amount,
      paymentMethod,
      status: 'pending',
      orderNo: this.generateOrderNo('RC'),
      expireTime: new Date(Date.now() + 30 * 60 * 1000), // 30分钟过期
    });

    const savedOrder = await this.rechargeOrderRepository.save(rechargeOrder);

    this.logger.log(`Created recharge order: ${savedOrder.orderNo} for user: ${userId}`);
    
    return {
      code: 201,
      message: '充值订单创建成功',
      data: savedOrder,
    };
  }

  /**
   * 充值支付回调
   */
  async rechargeCallback(orderNo: string, paymentStatus: string, transactionId?: string) {
    const rechargeOrder = await this.rechargeOrderRepository.findOne({
      where: { orderNo },
    });

    if (!rechargeOrder) {
      throw new Error('充值订单不存在');
    }

    if (rechargeOrder.status !== 'pending') {
      throw new Error('订单状态已处理');
    }

    // 更新订单状态
    rechargeOrder.status = paymentStatus === 'success' ? 'success' : 'failed';
    rechargeOrder.transactionId = transactionId;
    rechargeOrder.payTime = new Date();

    await this.rechargeOrderRepository.save(rechargeOrder);

    // 如果支付成功，更新用户余额
    if (paymentStatus === 'success') {
      await this.updateUserBalance(rechargeOrder.userId, rechargeOrder.amount, 'recharge', rechargeOrder.orderNo);
      
      this.logger.log(`Recharge success: order ${orderNo}, amount ${rechargeOrder.amount}`);
    } else {
      this.logger.warn(`Recharge failed: order ${orderNo}, status ${paymentStatus}`);
    }

    return {
      code: 200,
      message: '回调处理成功',
      data: rechargeOrder,
    };
  }

  /**
   * 创建提现订单
   */
  async createWithdrawOrder(createWithdrawDto: CreateWithdrawOrderDto) {
    const { userId, amount, withdrawMethod, accountInfo } = createWithdrawDto;

    // 检查用户余额
    const wallet = await this.getUserWallet(userId);
    
    if (wallet.balance < amount) {
      throw new Error('余额不足');
    }

    if (wallet.balance < amount + 1) { // 假设提现手续费1元
      throw new Error('余额不足以支付提现手续费');
    }

    // 冻结提现金额
    await this.freezeAmount(userId, amount + 1);

    // 创建提现订单
    const withdrawOrder = this.withdrawOrderRepository.create({
      userId,
      amount,
      fee: 1,
      actualAmount: amount - 1,
      withdrawMethod,
      accountInfo,
      status: 'pending',
      orderNo: this.generateOrderNo('WD'),
    });

    const savedOrder = await this.withdrawOrderRepository.save(withdrawOrder);

    this.logger.log(`Created withdraw order: ${savedOrder.orderNo} for user: ${userId}`);
    
    return {
      code: 201,
      message: '提现订单创建成功',
      data: savedOrder,
    };
  }

  /**
   * 审核提现订单
   */
  async auditWithdrawOrder(orderId: string, auditStatus: 'approved' | 'rejected', auditRemark?: string) {
    const withdrawOrder = await this.withdrawOrderRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });

    if (!withdrawOrder) {
      throw new Error('提现订单不存在');
    }

    if (withdrawOrder.status !== 'pending') {
      throw new Error('订单状态已处理');
    }

    withdrawOrder.status = auditStatus;
    withdrawOrder.auditTime = new Date();
    withdrawOrder.auditRemark = auditRemark;

    await this.withdrawOrderRepository.save(withdrawOrder);

    if (auditStatus === 'approved') {
      // 扣除冻结金额，创建交易记录
      await this.unfreezeAmount(withdrawOrder.userId, withdrawOrder.amount + withdrawOrder.fee);
      await this.createTransaction(
        withdrawOrder.userId,
        'withdraw',
        -(withdrawOrder.amount + withdrawOrder.fee),
        `提现到${withdrawOrder.withdrawMethod}`,
        withdrawOrder.orderNo,
      );
      
      this.logger.log(`Withdraw approved: order ${withdrawOrder.orderNo}, amount ${withdrawOrder.amount}`);
    } else {
      // 拒绝提现，解冻金额
      await this.unfreezeAmount(withdrawOrder.userId, withdrawOrder.amount + withdrawOrder.fee);
      
      this.logger.warn(`Withdraw rejected: order ${withdrawOrder.orderNo}, reason ${auditRemark}`);
    }

    return {
      code: 200,
      message: '审核处理成功',
      data: withdrawOrder,
    };
  }

  /**
   * 积分兑换
   */
  async exchangePoints(exchangeDto: PointsExchangeDto) {
    const { userId, productId, quantity } = exchangeDto;

    // 检查积分商品
    const pointsProduct = await this.pointsProductRepository.findOne({
      where: { id: productId, status: 'active' },
    });

    if (!pointsProduct) {
      throw new Error('积分商品不存在或已下架');
    }

    if (pointsProduct.stock < quantity) {
      throw new Error('积分商品库存不足');
    }

    // 检查用户积分
    const wallet = await this.getUserWallet(userId);
    const requiredPoints = pointsProduct.pointsPrice * quantity;

    if (wallet.points < requiredPoints) {
      throw new Error('积分不足');
    }

    // 扣除积分，更新库存
    await this.updateUserPoints(userId, -requiredPoints, 'exchange', `兑换积分商品${pointsProduct.name}`);
    
    // 更新商品库存
    await this.pointsProductRepository.update(
      { id: productId },
      { 
        stock: pointsProduct.stock - quantity,
        exchangeCount: pointsProduct.exchangeCount + quantity,
      }
    );

    // 创建兑换记录
    const exchangeRecord = this.pointsExchangeRepository.create({
      userId,
      productId,
      productName: pointsProduct.name,
      quantity,
      pointsUsed: requiredPoints,
      status: 'success',
    });

    const savedRecord = await this.pointsExchangeRepository.save(exchangeRecord);

    this.logger.log(`Points exchange: user ${userId}, product ${productId}, points ${requiredPoints}`);

    return {
      code: 201,
      message: '积分兑换成功',
      data: savedRecord,
    };
  }

  /**
   * 获取钱包流水
   */
  async getWalletTransactions(searchDto: WalletSearchDto) {
    const { userId, type, startDate, endDate, page = 1, limit = 10 } = searchDto;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const total = await queryBuilder.getCount();

    const transactions = await queryBuilder
      .orderBy('transaction.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      code: 200,
      message: '获取成功',
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  /**
   * 更新用户余额
   */
  private async updateUserBalance(userId: string, amount: number, type: string, orderNo?: string) {
    const wallet = await this.getUserWallet(userId);
    
    wallet.balance += amount;
    wallet.totalIncome = amount > 0 ? wallet.totalIncome + amount : wallet.totalIncome;
    wallet.totalExpense = amount < 0 ? wallet.totalExpense - amount : wallet.totalExpense;
    wallet.lastTransactionTime = new Date();

    await this.walletRepository.save(wallet);

    // 创建交易记录
    await this.createTransaction(userId, type, amount, type === 'recharge' ? '充值' : '提现', orderNo);
  }

  /**
   * 更新用户积分
   */
  private async updateUserPoints(userId: string, points: number, type: string, remark: string) {
    const wallet = await this.getUserWallet(userId);
    
    wallet.points += points;
    wallet.lastTransactionTime = new Date();

    await this.walletRepository.save(wallet);

    // 创建积分变动记录
    await this.createTransaction(userId, type, points, remark);
  }

  /**
   * 冻结金额
   */
  private async freezeAmount(userId: string, amount: number) {
    const wallet = await this.getUserWallet(userId);
    
    if (wallet.balance < amount) {
      throw new Error('余额不足');
    }

    wallet.balance -= amount;
    wallet.frozenAmount += amount;

    await this.walletRepository.save(wallet);
  }

  /**
   * 解冻金额
   */
  private async unfreezeAmount(userId: string, amount: number) {
    const wallet = await this.getUserWallet(userId);
    
    wallet.frozenAmount -= amount;

    await this.walletRepository.save(wallet);
  }

  /**
   * 创建交易记录
   */
  private async createTransaction(
    userId: string, 
    type: string, 
    amount: number, 
    remark: string, 
    orderNo?: string
  ) {
    const transaction = this.transactionRepository.create({
      userId,
      type,
      amount,
      remark,
      orderNo,
      balanceBefore: 0, // 需要从wallet获取
      balanceAfter: 0,  // 需要从wallet获取
    });

    await this.transactionRepository.save(transaction);
  }

  /**
   * 生成订单号
   */
  private generateOrderNo(prefix: string): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * 获取钱包统计
   */
  async getWalletStatistics(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 获取统计数据
    const [totalIncome, totalExpense, transactionCount] = await Promise.all([
      this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END)', 'total')
        .where('transaction.userId = :userId AND transaction.amount > 0 AND transaction.createdAt >= :startDate', {
          userId,
          startDate,
        })
        .getRawOne(),
      
      this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END)', 'total')
        .where('transaction.userId = :userId AND transaction.amount < 0 AND transaction.createdAt >= :startDate', {
          userId,
          startDate,
        })
        .getRawOne(),
      
      this.transactionRepository
        .createQueryBuilder('transaction')
        .where('transaction.userId = :userId AND transaction.createdAt >= :startDate', {
          userId,
          startDate,
        })
        .getCount(),
    ]);

    const wallet = await this.getUserWallet(userId);

    return {
      code: 200,
      message: '获取成功',
      data: {
        currentBalance: wallet.balance,
        frozenAmount: wallet.frozenAmount,
        availableBalance: wallet.balance - wallet.frozenAmount,
        currentPoints: wallet.points,
        totalIncome: totalIncome?.total || 0,
        totalExpense: totalExpense?.total || 0,
        transactionCount,
        period: `${days}天`,
      },
    };
  }
}