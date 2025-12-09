// 分库分表配置

export interface ShardingConfig {
  // 分表数量
  tableCount: number;
  // 分表字段
  shardingColumn: string;
  // 分表策略类型
  shardingStrategy: 'hash' | 'range';
}

// 计算分表索引
export function getTableIndex(shardingValue: string, tableCount: number): number {
  if (!shardingValue) {
    throw new Error('分表字段值不能为空');
  }
  
  // 简单的哈希算法
  let hash = 0;
  for (let i = 0; i < shardingValue.length; i++) {
    const char = shardingValue.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // 取绝对值并取模
  return Math.abs(hash) % tableCount;
}

// 获取分表名称
export function getTableName(baseTableName: string, tableIndex: number): string {
  return `${baseTableName}_${tableIndex.toString().padStart(2, '0')}`;
}

// 订单表分表配置
export const orderShardingConfig: ShardingConfig = {
  tableCount: 16, // 分16张表
  shardingColumn: 'order_sn', // 根据订单号分表
  shardingStrategy: 'hash', // 哈希取模策略
};
