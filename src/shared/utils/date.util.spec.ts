import { DateUtil } from './date.util';

describe('DateUtil', () => {
  describe('format', () => {
    it('应该正确格式化日期', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const formatted = DateUtil.format(date, 'YYYY-MM-DD HH:mm:ss');
      expect(formatted).toContain('2024-01-01');
    });

    it('应该处理字符串日期', () => {
      const formatted = DateUtil.format('2024-01-01', 'YYYY-MM-DD');
      expect(formatted).toBe('2024-01-01');
    });

    it('应该处理无效日期', () => {
      const formatted = DateUtil.format('invalid', 'YYYY-MM-DD');
      expect(formatted).toBe('');
    });
  });

  describe('parse', () => {
    it('应该正确解析日期字符串', () => {
      const date = DateUtil.parse('2024-01-01T12:00:00Z');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2024);
    });

    it('应该返回null对于无效日期', () => {
      const date = DateUtil.parse('invalid');
      expect(date).toBeNull();
    });
  });

  describe('addDays', () => {
    it('应该正确添加天数', () => {
      const date = new Date('2024-01-01');
      const result = DateUtil.addDays(date, 1);
      expect(result.getDate()).toBe(2);
    });

    it('应该正确处理负数', () => {
      const date = new Date('2024-01-02');
      const result = DateUtil.addDays(date, -1);
      expect(result.getDate()).toBe(1);
    });
  });

  describe('isToday', () => {
    it('应该正确判断今天', () => {
      const today = new Date();
      expect(DateUtil.isToday(today)).toBe(true);
    });

    it('应该正确判断非今天', () => {
      const yesterday = DateUtil.addDays(new Date(), -1);
      expect(DateUtil.isToday(yesterday)).toBe(false);
    });
  });

  describe('diffDays', () => {
    it('应该正确计算天数差', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-03');
      expect(DateUtil.diffDays(date1, date2)).toBe(2);
    });
  });
});

