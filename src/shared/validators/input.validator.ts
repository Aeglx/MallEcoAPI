import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class InputValidator {
  
  /**
   * 验证手机号格式
   */
  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      throw new BadRequestException('手机号格式不正确');
    }
    return true;
  }

  /**
   * 验证邮箱格式
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('邮箱格式不正确');
    }
    return true;
  }

  /**
   * 验证身份证号格式
   */
  validateIdCard(idCard: string): boolean {
    const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    if (!idCardRegex.test(idCard)) {
      throw new BadRequestException('身份证号格式不正确');
    }
    return true;
  }

  /**
   * 验证银行卡号格式
   */
  validateBankCard(bankCard: string): boolean {
    const bankCardRegex = /^\d{16,19}$/;
    if (!bankCardRegex.test(bankCard)) {
      throw new BadRequestException('银行卡号格式不正确');
    }
    return true;
  }

  /**
   * 验证金额格式（两位小数）
   */
  validateAmount(amount: number): boolean {
    if (amount <= 0) {
      throw new BadRequestException('金额必须大于0');
    }
    
    const amountStr = amount.toString();
    const decimalRegex = /^\d+(\.\d{1,2})?$/;
    if (!decimalRegex.test(amountStr)) {
      throw new BadRequestException('金额格式不正确，最多支持两位小数');
    }
    
    return true;
  }

  /**
   * 验证字符串长度
   */
  validateStringLength(str: string, min: number, max: number, fieldName: string): boolean {
    if (str.length < min || str.length > max) {
      throw new BadRequestException(`${fieldName}长度必须在${min}-${max}个字符之间`);
    }
    return true;
  }

  /**
   * 验证数字范围
   */
  validateNumberRange(num: number, min: number, max: number, fieldName: string): boolean {
    if (num < min || num > max) {
      throw new BadRequestException(`${fieldName}必须在${min}-${max}之间`);
    }
    return true;
  }

  /**
   * 验证是否为正整数
   */
  validatePositiveInteger(num: number, fieldName: string): boolean {
    if (!Number.isInteger(num) || num <= 0) {
      throw new BadRequestException(`${fieldName}必须为正整数`);
    }
    return true;
  }

  /**
   * 防止SQL注入攻击
   */
  sanitizeInput(input: string): string {
    if (!input) return input;
    
    // 移除危险字符
    const dangerousChars = [';', '"', "'", '--', '/*', '*/', 'xp_', 'exec', 'union', 'select'];
    let sanitized = input;
    
    dangerousChars.forEach(char => {
      const regex = new RegExp(char, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    // 限制长度
    if (sanitized.length > 1000) {
      sanitized = sanitized.substring(0, 1000);
    }
    
    return sanitized.trim();
  }

  /**
   * 验证文件上传类型
   */
  validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`文件类型不支持，支持的类型: ${allowedTypes.join(', ')}`);
    }
    
    // 验证文件大小（最大10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('文件大小不能超过10MB');
    }
    
    return true;
  }

  /**
   * 验证日期格式
   */
  validateDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('日期格式不正确');
    }
    
    // 验证日期是否在合理范围内
    const minDate = new Date('1900-01-01');
    const maxDate = new Date('2100-12-31');
    if (date < minDate || date > maxDate) {
      throw new BadRequestException('日期超出有效范围');
    }
    
    return true;
  }

  /**
   * 批量验证输入
   */
  validateBatch(inputs: { value: any; validator: (value: any) => boolean; fieldName: string }[]): boolean {
    for (const input of inputs) {
      try {
        input.validator(input.value);
      } catch (error) {
        throw new BadRequestException(`${input.fieldName}: ${error.message}`);
      }
    }
    return true;
  }
}