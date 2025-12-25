import { ResultUtil, ResultCode } from './result.util';

describe('ResultUtil', () => {
  describe('data', () => {
    it('应该返回成功的数据响应', () => {
      const data = { id: 1, name: 'test' };
      const result = ResultUtil.data(data);

      expect(result.success).toBe(true);
      expect(result.code).toBe(ResultCode.SUCCESS);
      expect(result.result).toEqual(data);
      expect(result.data).toEqual(data);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('success', () => {
    it('应该返回成功消息', () => {
      const result = ResultUtil.success();

      expect(result.success).toBe(true);
      expect(result.code).toBe(ResultCode.SUCCESS);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('successWithMessage', () => {
    it('应该返回带自定义消息的成功响应', () => {
      const message = '操作成功';
      const result = ResultUtil.successWithMessage(message);

      expect(result.success).toBe(true);
      expect(result.message).toBe(message);
      expect(result.code).toBe(ResultCode.SUCCESS);
    });
  });

  describe('error', () => {
    it('应该返回错误消息', () => {
      const result = ResultUtil.error();

      expect(result.success).toBe(false);
      expect(result.code).toBe(ResultCode.ERROR);
      expect(result.timestamp).toBeDefined();
    });

    it('应该返回带自定义消息的错误响应', () => {
      const message = '资源不存在';
      const result = ResultUtil.error(ResultCode.NOT_FOUND, message);

      expect(result.success).toBe(false);
      expect(result.code).toBe(ResultCode.NOT_FOUND);
      expect(result.message).toBe(message);
    });
  });

  describe('errorWithMessage', () => {
    it('应该返回带自定义消息的错误响应', () => {
      const message = '操作失败';
      const result = ResultUtil.errorWithMessage(message);

      expect(result.success).toBe(false);
      expect(result.message).toBe(message);
      expect(result.code).toBe(ResultCode.ERROR);
    });
  });
});

