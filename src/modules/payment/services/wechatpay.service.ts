import { Injectable, Logger } from '@nestjs/common';
import { PaymentRecord } from '../entities/payment-record.entity';
import { QueryPaymentDto } from '../dto/query-payment.dto';
import { PaymentCallbackDto } from '../dto/payment-callback.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WechatPayService {
  private readonly logger = new Logger(WechatPayService.name);
  private readonly wechatpay: any;

  constructor() {
    try {
      // 读取证书文件
      const privateKey = fs.readFileSync(
        path.join(process.cwd(), 'config', 'wechatpay', 'private_key.pem'),
        'utf8',
      );
      const certificate = fs.readFileSync(
        path.join(process.cwd(), 'config', 'wechatpay', 'cert.pem'),
        'utf8',
      );

      // 初始化微信支付SDK
      this.wechatpay = new (require('wechatpay-node-v3').default)({
        appid: process.env.WECHAT_APPID,
        mchid: process.env.WECHAT_MCHID,
        publicKey: certificate,
        privateKey,
        notify_url: process.env.WECHAT_NOTIFY_URL,
      });
    } catch (error) {
      this.logger.warn('微信支付证书文件不存在或无法读取，微信支付功能将不可用:', error.message);
      this.wechatpay = null;
    }
  }

  async createPayment(paymentRecord: PaymentRecord, paymentClient: string, queryPaymentDto: QueryPaymentDto) {
    try {
      const notifyUrl = process.env.WECHAT_NOTIFY_URL || 'https://example.com/payment/callback/wechatpay';

      // 构建支付参数
      const params = {
        description: paymentRecord.subject,
        out_trade_no: paymentRecord.outTradeNo,
        notify_url: notifyUrl,
        amount: {
          total: Math.round(paymentRecord.amount * 100), // 微信支付金额单位为分
          currency: 'CNY',
        },
      };

      let result;

      // 根据客户端类型调用不同的支付接口
      switch (paymentClient) {
        case 'pc':
          // JSAPI支付
          if (!queryPaymentDto.openId) {
            throw new Error('JSAPI支付需要用户openId');
          }
          result = await this.wechatpay.pay.transactions_jsapi.post({
            ...params,
            payer: {
              openid: queryPaymentDto.openId,
            },
          });
          break;
        case 'h5':
          // H5支付
          result = await this.wechatpay.pay.transactions_h5.post({
            ...params,
            scene_info: {
              payer_client_ip: '127.0.0.1',
              h5_info: {
                type: 'Wap',
                app_name: 'MallEco',
                app_url: 'https://example.com',
              },
            },
          });
          break;
        case 'app':
          // APP支付
          result = await this.wechatpay.pay.transactions_app.post(params);
          break;
        case 'mini_program':
          // 小程序支付
          if (!queryPaymentDto.openId) {
            throw new Error('小程序支付需要用户openId');
          }
          result = await this.wechatpay.pay.transactions_jsapi.post({
            ...params,
            payer: {
              openid: queryPaymentDto.openId,
            },
          });
          break;
        default:
          throw new Error('不支持的支付客户端类型');
      }

      return result;
    } catch (error) {
      this.logger.error('创建微信支付订单失败:', error);
      throw error;
    }
  }

  async handleCallback(callbackData: PaymentCallbackDto) {
    try {
      // 验证回调签名
      const { signature, timestamp, nonce, body } = callbackData;
      const verifyResult = this.wechatpay.verifySign(signature, timestamp, nonce, body);

      if (!verifyResult) {
        this.logger.error('微信支付回调签名验证失败:', callbackData);
        return {
          success: false,
          message: '签名验证失败',
        };
      }

      // 解析回调数据
      const data = JSON.parse(body);
      const { out_trade_no, transaction_id, amount, success_time } = data;

      return {
        success: true,
        outTradeNo: out_trade_no,
        tradeNo: transaction_id,
        amount: amount.total / 100, // 微信支付金额单位为分
        payTime: new Date(success_time),
      };
    } catch (error) {
      this.logger.error('处理微信支付回调失败:', error);
      throw error;
    }
  }

  async queryPayment(outTradeNo: string) {
    try {
      const result = await this.wechatpay.pay.transactions_id._(outTradeNo).get();
      return result;
    } catch (error) {
      this.logger.error('查询微信支付结果失败:', error);
      throw error;
    }
  }

  async closePayment(outTradeNo: string) {
    try {
      const result = await this.wechatpay.pay.transactions_out_trade_no._(outTradeNo).close.post({
        mchid: process.env.WECHAT_MCHID,
      });

      return {
        success: true,
      };
    } catch (error) {
      this.logger.error('关闭微信支付订单失败:', error);
      throw error;
    }
  }
}