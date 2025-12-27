import { BatchQueryUtil } from './batch-query.util';

describe('BatchQueryUtil', () => {
  describe('batchLoad', () => {
    it('应该批量加载并映射结果', async () => {
      const ids = ['1', '2', '3'];
      const mockData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ];

      const loader = jest.fn().mockResolvedValue(mockData);

      const result = await BatchQueryUtil.batchLoad(ids, loader, 'id');

      expect(result.size).toBe(3);
      expect(result.get('1')).toEqual({ id: '1', name: 'Item 1' });
      expect(loader).toHaveBeenCalledWith(['1', '2', '3']);
    });

    it('应该处理空ID列表', async () => {
      const result = await BatchQueryUtil.batchLoad([], jest.fn(), 'id');
      expect(result.size).toBe(0);
    });

    it('应该去重ID', async () => {
      const ids = ['1', '2', '1', '3'];
      const loader = jest.fn().mockResolvedValue([
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ]);

      await BatchQueryUtil.batchLoad(ids, loader, 'id');

      expect(loader).toHaveBeenCalledWith(['1', '2', '3']);
    });
  });

  describe('batchLoadInChunks', () => {
    it('应该分批加载', async () => {
      const ids = Array.from({ length: 250 }, (_, i) => String(i));
      const loader = jest.fn().mockImplementation(chunkIds => {
        return Promise.resolve(chunkIds.map((id: string) => ({ id, name: `Item ${id}` })));
      });

      const result = await BatchQueryUtil.batchLoadInChunks(ids, loader, 100);

      expect(result.length).toBe(250);
      expect(loader).toHaveBeenCalledTimes(3); // 100, 100, 50
    });

    it('应该处理空ID列表', async () => {
      const result = await BatchQueryUtil.batchLoadInChunks([], jest.fn());
      expect(result.length).toBe(0);
    });
  });
});
