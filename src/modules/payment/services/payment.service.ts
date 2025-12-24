import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentRecord } from '../entities/payment-record.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { PaymentCallbackLog } from '../entities/payment-callback-log.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentCallbackDto } from '../dto/payment-callback.dto';
import { QueryPaymentDto } from '../dto/query-payment.dto';
import { AlipayService } from './alipay.service';
import { WechatPayService } from './wechatpay.service';
import { OrdersService } from '../../orders/orders.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(PaymentRecord) private paymentRecordRepository: Repository<PaymentRecord>,
    @InjectRepository(PaymentMethod) private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(PaymentCallbackLog) private paymentCallbackLogRepository: Repository<PaymentCallbackLog>,
    private readonly alipayService: AlipayService,
    private readonly wechatPayService: WechatPayService,
    private readonly ordersService: OrdersService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    // 验证支付方式是否存在且启用
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: {
        code: createPaymentDto.paymentMethod,
        status: 1,
      },
    });

    if (!paymentMethod) {
      throw new Error('支付方式不存在或已禁用');
    }

    // 生成商户订单号
    const outTradeNo = `PAY${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // 创建支付记录
    const paymentRecord = this.paymentRecordRepository.create({
      orderId: createPaymentDto.orderId,
      paymentMethodCode: createPaymentDto.paymentMethod,
      amount: createPaymentDto.amount,
      status: 0, // 待支付
      outTradeNo,
      subject: createPaymentDto.subject || `订单支付-${createPaymentDto.orderId}`,
      body: createPaymentDto.body || `订单支付-${createPaymentDto.orderId}`,
      clientType: createPaymentDto.paymentClient,
      returnUrl: createPaymentDto.returnUrl,
    });

    await this.paymentRecordRepository.save(paymentRecord);

    return {
      outTradeNo,
      paymentRecordId: paymentRecord.id,
    };
  }

  async payment(paymentMethod: string, paymentClient: string, queryPaymentDto: QueryPaymentDto) {
    // 查找支付记录
    const paymentRecord = await this.paymentRecordRepository.findOne({
      where: { outTradeNo: queryPaymentDto.outTradeNo },
    });

    if (!paymentRecord) {
      throw new Error('支付记录不存在');
    }

    if (paymentRecord.status !== 0) {
      throw new Error('该订单已支付或已关闭');
    }

    // 根据支付方式调用不同的支付服务
    switch (paymentMethod.toLowerCase()) {
      case 'alipay':
        return this.alipayService.createPayment(paymentRecord, paymentClient, queryPaymentDto);
      case 'wechatpay':
        return this.wechatPayService.createPayment(paymentRecord, paymentClient, queryPaymentDto);
      default:
        throw new Error('不支持的支付方式');
    }
  }

  async paymentCallback(paymentMethod: string, paymentCallbackDto: PaymentCallbackDto) {
    // 记录回调日志
    await this.paymentCallbackLogRepository.save({
      paymentMethodCode: paymentMethod,
      callbackData: paymentCallbackDto,
      callbackTime: new Date(),
    });

    let callbackResult;

    // 根据支付方式处理回调
    switch (paymentMethod.toLowerCase()) {
      case 'alipay':
        callbackResult = await this.alipayService.handleCallback(paymentCallbackDto);
        break;
      case 'wechatpay':
        callbackResult = await this.wechatPayService.handleCallback(paymentCallbackDto);
        break;
      default:
        throw new Error('不支持的支付方式');
    }

    if (callbackResult && callbackResult.success) {
      // 更新支付记录
      await this.paymentRecordRepository.update(callbackResult.outTradeNo, {
        status: 1, // 支付成功
        tradeNo: callbackResult.tradeNo,
        payTime: callbackResult.payTime,
      });

      // 更新订单状态
      const paymentRecord = await this.paymentRecordRepository.findOne({
        where: { outTradeNo: callbackResult.outTradeNo },
      });

      if (paymentRecord) {
        await this.ordersService.updateOrderStatus(paymentRecord.orderId, { status: 1, adminNote: '支付成功' });
      }
    }

    return callbackResult;
  }

  async queryPayment(outTradeNo: string) {
    const paymentRecord = await this.paymentRecordRepository.findOne({
      where: { outTradeNo },
      relations: ['paymentMethod'],
    });

    if (!paymentRecord) {
      throw new Error('支付记录不存在');
    }

    let queryResult;

    // 根据支付方式查询支付结果
    switch (paymentRecord.paymentMethodCode.toLowerCase()) {
      case 'alipay':
        queryResult = await this.alipayService.queryPayment(outTradeNo);
        break;
      case 'wechatpay':
        queryResult = await this.wechatPayService.queryPayment(outTradeNo);
        break;
      default:
        throw new Error('不支持的支付方式');
    }

    return {
      outTradeNo,
      status: paymentRecord.status,
      amount: paymentRecord.amount,
      paymentMethod: paymentRecord.paymentMethodCode,
      payTime: paymentRecord.payTime,
      tradeNo: paymentRecord.tradeNo,
      platformResult: queryResult,
    };
  }

  async closePayment(outTradeNo: string) {
    const paymentRecord = await this.paymentRecordRepository.findOne({
      where: { outTradeNo },
    });

    if (!paymentRecord) {
      throw new Error('支付记录不存在');
    }

    if (paymentRecord.status !== 0) {
      throw new Error('该订单已支付或已关闭');
    }

    let closeResult;

    // 根据支付方式关闭支付
    switch (paymentRecord.paymentMethodCode.toLowerCase()) {
      case 'alipay':
        closeResult = await this.alipayService.closePayment(outTradeNo);
        break;
      case 'wechatpay':
        closeResult = await this.wechatPayService.closePayment(outTradeNo);
        break;
      default:
        throw new Error('不支持的支付方式');
    }

    if (closeResult.success) {
      // 更新支付记录
      await this.paymentRecordRepository.update(outTradeNo, {
        status: 3, // 已关闭
      });
    }

    return closeResult;
  }

  async getPaymentMethods() {
    return this.paymentMethodRepository.find({
      where: { status: 1 },
      select: ['id', 'name', 'code', 'description', 'icon', 'sortOrder'],
      order: { sortOrder: 'ASC' },
    });
  }

  getCallbackResponse(paymentMethod: string): string {
    // 返回不同支付方式的回调响应格式
    switch (paymentMethod.toLowerCase()) {
      case 'alipay':
        return 'success';
      case 'wechatpay':
        return '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>';
      default:
        return 'success';
    }
  }
}