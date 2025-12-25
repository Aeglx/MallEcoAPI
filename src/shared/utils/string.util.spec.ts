import { StringUtil } from './string.util';

describe('StringUtil', () => {
  describe('isEmpty', () => {
    it('应该正确判断空字符串', () => {
      expect(StringUtil.isEmpty('')).toBe(true);
      expect(StringUtil.isEmpty('   ')).toBe(true);
      expect(StringUtil.isEmpty(null)).toBe(true);
      expect(StringUtil.isEmpty(undefined)).toBe(true);
      expect(StringUtil.isEmpty('test')).toBe(false);
    });
  });

  describe('isNotEmpty', () => {
    it('应该正确判断非空字符串', () => {
      expect(StringUtil.isNotEmpty('test')).toBe(true);
      expect(StringUtil.isNotEmpty('   ')).toBe(false);
      expect(StringUtil.isNotEmpty(null)).toBe(false);
    });
  });

  describe('camelToSnake', () => {
    it('应该将驼峰命名转换为下划线命名', () => {
      expect(StringUtil.camelToSnake('userName')).toBe('user_name');
      expect(StringUtil.camelToSnake('getUserInfo')).toBe('get_user_info');
    });
  });

  describe('snakeToCamel', () => {
    it('应该将下划线命名转换为驼峰命名', () => {
      expect(StringUtil.snakeToCamel('user_name')).toBe('userName');
      expect(StringUtil.snakeToCamel('get_user_info')).toBe('getUserInfo');
    });
  });

  describe('trim', () => {
    it('应该去除字符串两端空白', () => {
      expect(StringUtil.trim('  test  ')).toBe('test');
      expect(StringUtil.trim(null)).toBe('');
    });
  });
});

