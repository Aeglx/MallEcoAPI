import { Injectable, ConfigService } from '@nestjs/common';
import { Config } from 'src/config/config';
import * as SMSClient from 'aliyun-sdk-v2/sms';

@Injectable()
export class AliyunSmsService {
  private readonly smsClient: SMSClient;

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<Config>('config');
    this.smsClient = new SMSClient({
      accessKeyId: config?.sms?.accessKeyId,
      accessKeySecret: config?.sms?.accessKeySecret,
      endpoint: 'https://dysmsapi.aliyuncs.com',
    });
  }

  /**
   * 发送短信
   * @param phoneNumbers 手机号码
   * @param templateCode 短信模板代码
   * @param templateParam 短信模板参数
   * @returns 发送结果
   */
  async sendSms(phoneNumbers: string, templateCode: string, templateParam: Record<string, any>): Promise<any> {
    const config = this.configService.get<Config>('config');
    const params = {
      PhoneNumbers: phoneNumbers,
      SignName: config?.sms?.signName,
      TemplateCode: templateCode,
      TemplateParam: JSON.stringify(templateParam),
    };

    try {
      const result = await this.smsClient.send(params);
      return result;
    } catch (error) {
      throw new Error(`发送短信失败: ${error.message}`);
    }
  }

  /**
   * 查询短信发送记录
   * @param phoneNumber 手机号码
   * @param sendDate 发送日期，格式：yyyyMMdd
   * @param pageSize 每页大小
   * @param currentPage 当前页码
   * @returns 查询结果
   */
  async querySendDetails(phoneNumber: string, sendDate: string, pageSize: number = 10, currentPage: number = 1): Promise<any> {
    const params = {
      PhoneNumber: phoneNumber,
      SendDate: sendDate,
      PageSize: pageSize,
      CurrentPage: currentPage,
    };

    try {
      const result = await this.smsClient.query(params);
      return result;
    } catch (error) {
      throw new Error(`查询短信发送记录失败: ${error.message}`);
    }
  }
}
