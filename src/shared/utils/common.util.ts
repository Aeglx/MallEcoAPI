import { UuidUtil } from './uuid.util';

/**
 * 通用工具类
 * 参考：MallEcoPro/src/shared/utils/common.util.ts
 */
export class CommonUtil {
  /**
   * 基础数字字符
   */
  static readonly BASE_NUMBER = '0123456789';

  /**
   * 以UUID重命名文件
   */
  static rename(fileName: string): string {
    const extName = fileName.substring(fileName.lastIndexOf('.'));
    return UuidUtil.uuidWithoutDash() + extName;
  }

  /**
   * 随机6位数生成
   */
  static getRandomNum(): string {
    let sb = '';
    for (let i = 0; i < 6; i++) {
      const num = Math.floor(Math.random() * this.BASE_NUMBER.length);
      sb += this.BASE_NUMBER.charAt(num);
    }
    return sb;
  }

  /**
   * 获取特定字符 + 6位随机数
   */
  static getSpecialStr(value: string): string {
    return value + this.getRandomNum();
  }

  /**
   * 生成订单号
   */
  static generateOrderSn(): string {
    return `ORDER${Date.now()}${this.getRandomNum()}`;
  }

  /**
   * 生成商品编号
   */
  static generateGoodsSn(): string {
    return `GOODS${Date.now()}${this.getRandomNum()}`;
  }

  /**
   * 生成支付单号
   */
  static generatePaymentSn(): string {
    return `PAY${Date.now()}${this.getRandomNum()}`;
  }
}
