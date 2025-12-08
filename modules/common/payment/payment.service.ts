import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentLog } from './entities/payment-log.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PayStatus, PayType, RefundStatus } from './enum/payment-status.enum';
import { OrderService } from '../order/order.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentLog) private paymentLogRepository: Repository<PaymentLog>,
    private orderService: OrderService,
  ) {}

  /**
   * 创建支付订单
   * @param createPaymentDto 创建支付订单DTO
   * @returns 创建的支付订单
   */
  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // 检查订单是否存在
    const order = await this.orderService.findByOrderSn(createPaymentDto.orderSn);
    if (!order) {
      throw new NotFoundException(`Order with SN ${createPaymentDto.orderSn} not found`);
    }

    // 生成支付单号
    const paySn = this.generatePaySn();

    // 创建支付记录
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      paySn,
      payStatus: PayStatus.PENDING,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // 创建支付日志
    await this.createPaymentLog(
      paySn,
      createPaymentDto.orderSn,
      PayStatus.PENDING,
      '创建支付订单',
      JSON.stringify(createPaymentDto),
    );

    return savedPayment;
  }

  /**
   * 查询支付订单列表
   * @returns 支付订单列表
   */
  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find({
      relations: ['paymentLogs'],
    });
  }

  /**
   * 根据ID查询支付订单
   * @param id 支付订单ID
   * @returns 支付订单
   */
  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['paymentLogs'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  /**
   * 根据支付单号查询支付订单
   * @param paySn 支付单号
   * @returns 支付订单
   */
  async findByPaySn(paySn: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { paySn },
      relations: ['paymentLogs'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with SN ${paySn} not found`);
    }
    return payment;
  }

  /**
   * 根据订单编号查询支付订单
   * @param orderSn 订单编号
   * @returns 支付订单
   */
  async findByOrderSn(orderSn: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { orderSn },
      relations: ['paymentLogs'],
    });
  }

  /**
   * 更新支付订单
   * @param id 支付订单ID
   * @param updatePaymentDto 更新支付订单DTO
   * @returns 更新后的支付订单
   */
  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);

    // 更新支付状态
    if (updatePaymentDto.payStatus && updatePaymentDto.payStatus !== payment.payStatus) {
      payment.payStatus = updatePaymentDto.payStatus;
      
      // 如果支付成功，更新支付时间和订单状态
      if (updatePaymentDto.payStatus === PayStatus.SUCCESS) {
        payment.payTime = new Date();
        await this.orderService.payOrder(payment.orderSn, payment.payType, updatePaymentDto.transactionId || '');
      }
      
      // 如果支付失败或取消，更新订单状态
      if ([PayStatus.FAIL, PayStatus.CANCELLED, PayStatus.TIMEOUT].includes(updatePaymentDto.payStatus)) {
        await this.orderService.cancelOrder(payment.orderSn, '支付失败或取消');
      }
    }

    // 更新其他字段
    if (updatePaymentDto.transactionId) {
      payment.transactionId = updatePaymentDto.transactionId;
    }
    if (updatePaymentDto.callbackContent) {
      payment.callbackContent = updatePaymentDto.callbackContent;
    }
    if (updatePaymentDto.callbackUrl) {
      payment.callbackUrl = updatePaymentDto.callbackUrl;
    }
    if (updatePaymentDto.returnUrl) {
      payment.returnUrl = updatePaymentDto.returnUrl;
    }
    if (updatePaymentDto.payAmount) {
      payment.payAmount = updatePaymentDto.payAmount;
    }

    const updatedPayment = await this.paymentRepository.save(payment);

    // 创建支付日志
    await this.createPaymentLog(
      payment.paySn,
      payment.orderSn,
      payment.payStatus,
      '更新支付订单',
      JSON.stringify(updatePaymentDto),
    );

    return updatedPayment;
  }

  /**
   * 删除支付订单
   * @param id 支付订单ID
   * @returns 删除结果
   */
  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
  }

  /**
   * 处理支付回调
   * @param paySn 支付单号
   * @param status 支付状态
   * @param transactionId 交易流水号
   * @param callbackData 回调数据
   * @returns 处理结果
   */
  async handleCallback(paySn: string, status: PayStatus, transactionId: string, callbackData: string): Promise<Payment> {
    const payment = await this.findByPaySn(paySn);

    // 更新支付状态
    payment.payStatus = status;
    payment.transactionId = transactionId;
    payment.callbackContent = callbackData;

    if (status === PayStatus.SUCCESS) {
      payment.payTime = new Date();
      // 更新订单状态为已支付
      await this.orderService.payOrder(payment.orderSn, payment.payType, transactionId);
    }

    const updatedPayment = await this.paymentRepository.save(payment);

    // 创建支付日志
    await this.createPaymentLog(
      paySn,
      payment.orderSn,
      status,
      '支付回调处理',
      callbackData,
    );

    return updatedPayment;
  }

  /**
   * 发起退款
   * @param refundPaymentDto 退款DTO
   * @returns 退款结果
   */
  async refund(refundPaymentDto: RefundPaymentDto): Promise<Payment> {
    const payment = await this.findByPaySn(refundPaymentDto.paySn);

    // 检查支付状态
    if (payment.payStatus !== PayStatus.SUCCESS) {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    // 检查退款金额
    if (refundPaymentDto.refundAmount > payment.payAmount) {
      throw new BadRequestException('Refund amount cannot exceed payment amount');
    }

    // 更新支付状态为已退款
    payment.payStatus = PayStatus.REFUNDED;
    payment.refundTime = new Date();

    const updatedPayment = await this.paymentRepository.save(payment);

    // 创建支付日志
    await this.createPaymentLog(
      refundPaymentDto.paySn,
      payment.orderSn,
      PayStatus.REFUNDED,
      `发起退款: ${refundPaymentDto.refundReason}`,
      JSON.stringify(refundPaymentDto),
    );

    return updatedPayment;
  }

  /**
   * 生成支付单号
   * @returns 支付单号
   */
  private generatePaySn(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `P${year}${month}${day}${hour}${minute}${second}${random}`;
  }

  /**
   * 创建支付日志
   * @param paySn 支付单号
   * @param orderSn 订单编号
   * @param payStatus 支付状态
   * @param remark 备注
   * @param requestContent 请求内容
   * @param responseContent 响应内容
   * @returns 支付日志
   */
  private async createPaymentLog(
    paySn: string,
    orderSn: string,
    payStatus: PayStatus,
    remark: string,
    requestContent: string,
    responseContent?: string,
  ): Promise<PaymentLog> {
    const paymentLog = this.paymentLogRepository.create({
      paySn,
      orderSn,
      payStatus,
      remark,
      requestContent,
      responseContent,
      operateTime: new Date(),
    });
    return await this.paymentLogRepository.save(paymentLog);
  }
}
