import { Injectable, ConfigService } from '@nestjs/common';
import { Config } from 'src/config/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpEmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<Config>('config');
    this.transporter = nodemailer.createTransport({
      host: config?.email?.smtp?.host,
      port: config?.email?.smtp?.port,
      secure: config?.email?.smtp?.secure,
      auth: {
        user: config?.email?.smtp?.username,
        pass: config?.email?.smtp?.password,
      },
    });
  }

  /**
   * 发送邮件
   * @param to 收件人邮箱
   * @param subject 邮件主题
   * @param html 邮件内容（HTML格式）
   * @param text 邮件内容（纯文本格式）
   * @returns 发送结果
   */
  async sendMail(to: string, subject: string, html?: string, text?: string): Promise<any> {
    const config = this.configService.get<Config>('config');
    const mailOptions: nodemailer.SendMailOptions = {
      from: `${config?.email?.smtp?.fromName} <${config?.email?.smtp?.fromAddress}>`,
      to,
      subject,
      html,
      text,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      throw new Error(`发送邮件失败: ${error.message}`);
    }
  }

  /**
   * 验证SMTP配置
   * @returns 是否验证通过
   */
  async verifyConfig(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      return false;
    }
  }
}
