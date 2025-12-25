/**
 * 字符串工具类
 * 参考：MallEcoPro/src/shared/utils/string.util.ts
 */
export class StringUtil {
  /**
   * 判断字符串是否为空
   */
  static isEmpty(str: string | null | undefined): boolean {
    return str === null || str === undefined || str.trim().length === 0;
  }

  /**
   * 判断字符串是否不为空
   */
  static isNotEmpty(str: string | null | undefined): boolean {
    return !this.isEmpty(str);
  }

  /**
   * 判断字符串是否为空白
   */
  static isBlank(str: string | null | undefined): boolean {
    return str === null || str === undefined || str.trim().length === 0;
  }

  /**
   * 判断字符串是否不为空白
   */
  static isNotBlank(str: string | null | undefined): boolean {
    return !this.isBlank(str);
  }

  /**
   * 去除字符串两端空白
   */
  static trim(str: string | null | undefined): string {
    return str?.trim() || '';
  }

  /**
   * 去除字符串所有空白
   */
  static trimAll(str: string | null | undefined): string {
    return str?.replace(/\s+/g, '') || '';
  }

  /**
   * 字符串首字母大写
   */
  static capitalize(str: string): string {
    if (this.isEmpty(str)) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 字符串首字母小写
   */
  static uncapitalize(str: string): string {
    if (this.isEmpty(str)) {
      return str;
    }
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * 驼峰命名转下划线命名
   */
  static camelToSnake(str: string): string {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  /**
   * 下划线命名转驼峰命名
   */
  static snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * 截取字符串
   */
  static substring(str: string, start: number, end?: number): string {
    if (this.isEmpty(str)) {
      return '';
    }
    return str.substring(start, end);
  }

  /**
   * 字符串替换
   */
  static replace(str: string, searchValue: string | RegExp, replaceValue: string): string {
    if (this.isEmpty(str)) {
      return '';
    }
    return str.replace(searchValue, replaceValue);
  }

  /**
   * 字符串替换所有
   */
  static replaceAll(str: string, searchValue: string, replaceValue: string): string {
    if (this.isEmpty(str)) {
      return '';
    }
    return str.split(searchValue).join(replaceValue);
  }
}

