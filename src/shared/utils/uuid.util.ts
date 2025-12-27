import { randomBytes } from 'crypto';

/**
 * UUID工具类
 * 参考：MallEcoPro/src/shared/utils/uuid.util.ts
 */
export class UuidUtil {
  /**
   * 生成UUID（v4）
   */
  static uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * 生成UUID（不带横线）
   */
  static uuidWithoutDash(): string {
    return this.uuid().replace(/-/g, '');
  }

  /**
   * 生成短UUID（8位）
   */
  static shortUuid(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  /**
   * 生成随机字符串
   */
  static randomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成随机数字字符串
   */
  static randomNumberString(length: number = 6): string {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成随机十六进制字符串
   */
  static randomHex(length: number = 32): string {
    return randomBytes(length / 2).toString('hex');
  }
}
