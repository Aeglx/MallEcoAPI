import { Injectable, Logger } from '@nestjs/common';
import { PaymentRecord } from '../entities/payment-record.entity';
import { QueryPaymentDto } from '../dto/query-payment.dto';
import { PaymentCallbackDto } from '../dto/payment-callback.dto';
import AlipaySdk from 'alipay-sdk';

@Injectable()
export class AlipayService {
  private readonly logger = new Logger(AlipayService.name);
  private readonly alipaySdk: AlipaySdk;

  constructor() {
    // 初始化支付宝SDK
    this.alipaySdk = new AlipaySdk({
      appId: process.env.ALIPAY_APP_ID,
      privateKey: process.env.ALIPAY_PRIVATE_KEY,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
      gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
      signType: 'RSA2',
    });
  }

  async createPayment(paymentRecord: PaymentRecord, paymentClient: string, queryPaymentDto: QueryPaymentDto) {
    try {
      // 根据客户端类型设置不同的支付接口
      const method = this.getAlipayMethod(paymentClient);

      // 构建支付参数
      const params = {
        outTradeNo: paymentRecord.outTradeNo,
        totalAmount: paymentRecord.amount,
        subject: paymentRecord.subject,
        body: paymentRecord.body,
        productCode: this.getProductCode(paymentClient),
        returnUrl: paymentRecord.returnUrl || queryPaymentDto.returnUrl,
      };

      // 调用支付宝接口
      const result = await this.alipaySdk.exec(method, { bizContent: params });

      // 根据客户端类型返回不同的支付方式
      if (paymentClient === 'pc') {
        // PC端返回表单HTML
        return {
          form: result,
          paymentUrl: null,
        };
      } else if (paymentClient === 'h5') {
        // H5端返回支付URL
        return {
          form: null,
          paymentUrl: result,
        };
      } else if (paymentClient === 'app') {
        // APP端返回支付参数
        return {
          paymentParams: result,
        };
      }

      return result;
    } catch (error) {
      this.logger.error('创建支付宝支付订单失败:', error);
      throw error;
    }
  }

  async handleCallback(callbackData: PaymentCallbackDto) {
    try {
      // 验证回调签名
      const verifyResult = await this.alipaySdk.checkNotifySign(callbackData);

      if (!verifyResult) {
        this.logger.error('支付宝回调签名验证失败:', callbackData);
        return {
          success: false,
          message: '签名验证失败',
        };
      }

      // 处理业务逻辑
      const { out_trade_no, trade_no, total_amount, gmt_payment, trade_status } = callbackData;

      // 判断支付状态
      if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
        return {
          success: true,
          outTradeNo: out_trade_no,
          tradeNo: trade_no,
          amount: parseFloat(total_amount),
          payTime: new Date(gmt_payment),
        };
      } else {
        return {
          success: false,
          message: `支付状态异常: ${trade_status}`,
        };
      }
    } catch (error) {
      this.logger.error('处理支付宝回调失败:', error);
      throw error;
    }
  }

  async queryPayment(outTradeNo: string) {
    try {
      const result = await this.alipaySdk.exec('alipay.trade.query', {
        bizContent: {
          outTradeNo,
        },
      });

      return result;
    } catch (error) {
      this.logger.error('查询支付宝支付结果失败:', error);
      throw error;
    }
  }

  async closePayment(outTradeNo: string) {
    try {
      const result = await this.alipaySdk.exec('alipay.trade.close', {
        bizContent: {
          outTradeNo,
        },
      });

      if (result.code === '10000') {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          message: result.subMsg,
        };
      }
    } catch (error) {
      this.logger.error('关闭支付宝支付订单失败:', error);
      throw error;
    }
  }

  /**
   * 根据客户端类型获取支付宝接口方法
   */
  private getAlipayMethod(paymentClient: string): string {
    switch (paymentClient) {
      case 'pc':
        return 'alipay.trade.page.pay';
      case 'h5':
        return 'alipay.trade.wap.pay';
      case 'app':
        return 'alipay.trade.app.pay';
      case 'mini_program':
        return 'alipay.trade.create';
      default:
        return 'alipay.trade.page.pay';
    }
  }

  /**
   * 根据客户端类型获取产品码
   */
  private getProductCode(paymentClient: string): string {
    switch (paymentClient) {
      case 'pc':
        return 'FAST_INSTANT_TRADE_PAY';
      case 'h5':
        return 'QUICK_WAP_WAY';
      case 'app':
        return 'QUICK_MSECURITY_PAY';
      case 'mini_program':
        return 'QUICK_MSECURITY_PAY';
      default:
        return 'FAST_INSTANT_TRADE_PAY';
    }
  }
}
