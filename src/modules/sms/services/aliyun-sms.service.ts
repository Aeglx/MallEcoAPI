import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AliyunSmsService {
  private readonly smsClient: any;

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get('config');
    this.smsClient = new (require('@alicloud/pop-core').default)({
      accessKeyId: config?.sms?.accessKeyId,
      accessKeySecret: config?.sms?.accessKeySecret,
      endpoint: 'https://dysmsapi.aliyuncs.com',
      apiVersion: '2017-05-25',
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
    const config = this.configService.get('config');
    const params = {
      RegionId: 'cn-hangzhou',
      PhoneNumbers: phoneNumbers,
      SignName: config?.sms?.signName,
      TemplateCode: templateCode,
      TemplateParam: JSON.stringify(templateParam),
    };

    try {
      const result = await this.smsClient.request('SendSms', params, {
        method: 'POST',
      });
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
      RegionId: 'cn-hangzhou',
      PhoneNumber: phoneNumber,
      SendDate: sendDate,
      PageSize: pageSize,
      CurrentPage: currentPage,
    };

    try {
      const result = await this.smsClient.request('QuerySendDetails', params, {
        method: 'POST',
      });
      return result;
    } catch (error) {
      throw new Error(`查询短信发送记录失败: ${error.message}`);
    }
  }
}