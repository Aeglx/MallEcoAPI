import { Injectable } from '@nestjs/common';
import { Wallet } from './entities/wallet.entity';
import {
  WalletTransaction,
  TransactionType,
  TransactionStatus,
  TransactionBusinessType,
} from './entities/wallet-transaction.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { RechargeDto } from './dto/recharge.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@Injectable()
export class WalletService {
  private wallets: Wallet[] = [];
  private transactions: WalletTransaction[] = [];

  /**
   * 创建钱包
   * @param dto 创建钱包DTO
   * @returns 创建的钱包
   */
  createWallet(dto: CreateWalletDto): Wallet {
    // 检查用户是否已存在钱包
    const existingWallet = this.wallets.find(wallet => wallet.userId === dto.userId);
    if (existingWallet) {
      return existingWallet;
    }

    const wallet = new Wallet();
    wallet.id = Date.now().toString();
    wallet.userId = dto.userId;
    wallet.balance = 0;
    wallet.frozenAmount = 0;
    wallet.totalIncome = 0;
    wallet.totalExpense = 0;
    wallet.createTime = new Date();
    wallet.updateTime = new Date();
    wallet.isDel = 0;

    this.wallets.push(wallet);
    return wallet;
  }

  /**
   * 获取用户钱包
   * @param userId 用户ID
   * @returns 钱包信息
   */
  getWalletByUserId(userId: string): Wallet | null {
    return this.wallets.find(wallet => wallet.userId === userId && wallet.isDel === 0) || null;
  }

  /**
   * 充值
   * @param userId 用户ID
   * @param dto 充值DTO
   * @returns 充值结果和交易记录
   */
  recharge(userId: string, dto: RechargeDto): { success: boolean; transaction: WalletTransaction } {
    const wallet = this.getWalletByUserId(userId);
    if (!wallet) {
      // 如果钱包不存在，自动创建
      const createWalletDto: CreateWalletDto = { userId };
      this.createWallet(createWalletDto);
    }

    const updatedWallet = this.getWalletByUserId(userId);
    const balanceBefore = updatedWallet.balance;
    const balanceAfter = balanceBefore + dto.amount;

    // 创建交易记录
    const transaction = new WalletTransaction();
    transaction.id = Date.now().toString();
    transaction.walletId = updatedWallet.id;
    transaction.userId = userId;
    transaction.transactionType = TransactionType.INCOME;
    transaction.amount = dto.amount;
    transaction.balanceBefore = balanceBefore;
    transaction.balanceAfter = balanceAfter;
    transaction.status = TransactionStatus.SUCCESS;
    transaction.businessType = TransactionBusinessType.RECHARGE;
    transaction.businessId = Date.now().toString(); // 生成充值业务ID
    transaction.remark = `充值${dto.amount}元，支付方式：${dto.paymentMethod}`;
    transaction.createTime = new Date();
    transaction.updateTime = new Date();
    transaction.isDel = 0;

    // 更新钱包信息
    updatedWallet.balance = balanceAfter;
    updatedWallet.totalIncome += dto.amount;
    updatedWallet.lastOperateTime = new Date();
    updatedWallet.lastOperateDesc = transaction.remark;
    updatedWallet.updateTime = new Date();

    this.transactions.push(transaction);
    return { success: true, transaction };
  }

  /**
   * 提现
   * @param userId 用户ID
   * @param dto 提现DTO
   * @returns 提现结果和交易记录
   */
  withdraw(userId: string, dto: WithdrawDto): { success: boolean; transaction: WalletTransaction } {
    const wallet = this.getWalletByUserId(userId);
    if (!wallet) {
      throw new Error('钱包不存在');
    }

    if (wallet.balance < dto.amount) {
      throw new Error('余额不足');
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - dto.amount;

    // 创建交易记录
    const transaction = new WalletTransaction();
    transaction.id = Date.now().toString();
    transaction.walletId = wallet.id;
    transaction.userId = userId;
    transaction.transactionType = TransactionType.EXPENSE;
    transaction.amount = dto.amount;
    transaction.balanceBefore = balanceBefore;
    transaction.balanceAfter = balanceAfter;
    transaction.status = TransactionStatus.SUCCESS;
    transaction.businessType = TransactionBusinessType.WITHDRAW;
    transaction.businessId = Date.now().toString(); // 生成提现业务ID
    transaction.remark = `提现${dto.amount}元，到账账户：${dto.bankName} ${dto.accountName} ${dto.bankAccount}`;
    transaction.createTime = new Date();
    transaction.updateTime = new Date();
    transaction.isDel = 0;

    // 更新钱包信息
    wallet.balance = balanceAfter;
    wallet.totalExpense += dto.amount;
    wallet.lastOperateTime = new Date();
    wallet.lastOperateDesc = transaction.remark;
    wallet.updateTime = new Date();

    this.transactions.push(transaction);
    return { success: true, transaction };
  }

  /**
   * 支付订单
   * @param userId 用户ID
   * @param amount 支付金额
   * @param orderId 订单ID
   * @returns 支付结果和交易记录
   */
  payOrder(
    userId: string,
    amount: number,
    orderId: string,
  ): { success: boolean; transaction: WalletTransaction } {
    const wallet = this.getWalletByUserId(userId);
    if (!wallet) {
      throw new Error('钱包不存在');
    }

    if (wallet.balance < amount) {
      throw new Error('余额不足');
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amount;

    // 创建交易记录
    const transaction = new WalletTransaction();
    transaction.id = Date.now().toString();
    transaction.walletId = wallet.id;
    transaction.userId = userId;
    transaction.transactionType = TransactionType.EXPENSE;
    transaction.amount = amount;
    transaction.balanceBefore = balanceBefore;
    transaction.balanceAfter = balanceAfter;
    transaction.status = TransactionStatus.SUCCESS;
    transaction.businessType = TransactionBusinessType.ORDER_PAYMENT;
    transaction.businessId = orderId;
    transaction.remark = `支付订单${orderId}，金额${amount}元`;
    transaction.createTime = new Date();
    transaction.updateTime = new Date();
    transaction.isDel = 0;

    // 更新钱包信息
    wallet.balance = balanceAfter;
    wallet.totalExpense += amount;
    wallet.lastOperateTime = new Date();
    wallet.lastOperateDesc = transaction.remark;
    wallet.updateTime = new Date();

    this.transactions.push(transaction);
    return { success: true, transaction };
  }

  /**
   * 订单退款
   * @param userId 用户ID
   * @param amount 退款金额
   * @param orderId 订单ID
   * @returns 退款结果和交易记录
   */
  refundOrder(
    userId: string,
    amount: number,
    orderId: string,
  ): { success: boolean; transaction: WalletTransaction } {
    const wallet = this.getWalletByUserId(userId);
    if (!wallet) {
      throw new Error('钱包不存在');
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    // 创建交易记录
    const transaction = new WalletTransaction();
    transaction.id = Date.now().toString();
    transaction.walletId = wallet.id;
    transaction.userId = userId;
    transaction.transactionType = TransactionType.INCOME;
    transaction.amount = amount;
    transaction.balanceBefore = balanceBefore;
    transaction.balanceAfter = balanceAfter;
    transaction.status = TransactionStatus.SUCCESS;
    transaction.businessType = TransactionBusinessType.ORDER_REFUND;
    transaction.businessId = orderId;
    transaction.remark = `订单${orderId}退款${amount}元`;
    transaction.createTime = new Date();
    transaction.updateTime = new Date();
    transaction.isDel = 0;

    // 更新钱包信息
    wallet.balance = balanceAfter;
    wallet.totalIncome += amount;
    wallet.lastOperateTime = new Date();
    wallet.lastOperateDesc = transaction.remark;
    wallet.updateTime = new Date();

    this.transactions.push(transaction);
    return { success: true, transaction };
  }

  /**
   * 获取交易记录
   * @param userId 用户ID
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 交易记录列表
   */
  getTransactions(userId: string, page: number = 1, pageSize: number = 10): WalletTransaction[] {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const userTransactions = this.transactions
      .filter(transaction => transaction.userId === userId && transaction.isDel === 0)
      .sort((a, b) => b.createTime.getTime() - a.createTime.getTime());

    return userTransactions.slice(startIndex, endIndex);
  }
}
