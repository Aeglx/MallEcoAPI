/**
 * 批量查询工具
 * 优化批量查询性能，减少数据库查询次数
 * 参考：MallEcoPro/src/shared/utils/batch-query.util.ts
 */
export class BatchQueryUtil {
  /**
   * 批量查询并映射结果
   * @param ids 要查询的ID列表
   * @param loader 查询函数
   * @param keyField 结果对象的key字段名（默认为'id'）
   * @returns Map<id, entity>
   */
  static async batchLoad<T extends Record<string, any>>(
    ids: string[],
    loader: (ids: string[]) => Promise<T[]>,
    keyField: string = 'id',
  ): Promise<Map<string, T>> {
    if (ids.length === 0) {
      return new Map();
    }

    // 去重
    const uniqueIds = Array.from(new Set(ids));

    // 批量加载
    const entities = await loader(uniqueIds);

    // 构建Map
    const map = new Map<string, T>();
    entities.forEach((entity) => {
      const key = String(entity[keyField]);
      map.set(key, entity);
    });

    return map;
  }

  /**
   * 分批查询（避免单次查询数据量过大）
   * @param ids 要查询的ID列表
   * @param loader 查询函数
   * @param batchSize 每批大小（默认100）
   * @returns 所有结果
   */
  static async batchLoadInChunks<T>(
    ids: string[],
    loader: (ids: string[]) => Promise<T[]>,
    batchSize: number = 100,
  ): Promise<T[]> {
    if (ids.length === 0) {
      return [];
    }

    const results: T[] = [];

    // 分批处理
    for (let i = 0; i < ids.length; i += batchSize) {
      const chunk = ids.slice(i, i + batchSize);
      const chunkResults = await loader(chunk);
      results.push(...chunkResults);
    }

    return results;
  }

  /**
   * 并行批量查询
   * @param batches 批次列表
   * @param loader 查询函数
   * @param concurrency 并发数（默认5）
   * @returns 所有结果
   */
  static async parallelBatchLoad<T>(
    batches: string[][],
    loader: (ids: string[]) => Promise<T[]>,
    concurrency: number = 5,
  ): Promise<T[]> {
    const results: T[] = [];

    // 控制并发
    for (let i = 0; i < batches.length; i += concurrency) {
      const concurrentBatches = batches.slice(i, i + concurrency);
      const promises = concurrentBatches.map((batch) => loader(batch));
      const batchResults = await Promise.all(promises);
      results.push(...batchResults.flat());
    }

    return results;
  }
}

