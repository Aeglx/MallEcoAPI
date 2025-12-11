import { DataSource } from 'typeorm';
import { ShardingSphereDataSource } from 'shardingsphere-typeorm';

export const createShardingDataSource = (): DataSource => {
  return new ShardingSphereDataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'malldb',
    
    // ShardingSphere配置
    sharding: {
      // 分片规则配置
      tables: {
        // 订单表分片配置
        orders: {
          actualDataNodes: 'malldb.orders_${0..3}',
          tableStrategy: {
            standard: {
              shardingColumn: 'user_id',
              preciseAlgorithmClassName: 'com.example.sharding.OrderTableShardingAlgorithm'
            }
          }
        },
        // 订单项表分片配置
        order_items: {
          actualDataNodes: 'malldb.order_items_${0..3}',
          tableStrategy: {
            standard: {
              shardingColumn: 'order_id',
              preciseAlgorithmClassName: 'com.example.sharding.OrderItemTableShardingAlgorithm'
            }
          }
        },
        // 支付记录表分片配置
        payments: {
          actualDataNodes: 'malldb.payments_${0..3}',
          tableStrategy: {
            standard: {
              shardingColumn: 'user_id',
              preciseAlgorithmClassName: 'com.example.sharding.PaymentTableShardingAlgorithm'
            }
          }
        }
      },
      
      // 默认分片策略
      defaultTableStrategy: {
        none: {}
      }
    },
    
    // 读写分离配置
    masterSlave: {
      name: 'ms',
      masterDataSourceName: 'master',
      slaveDataSourceNames: ['slave0', 'slave1'],
      loadBalanceAlgorithmType: 'ROUND_ROBIN'
    },
    
    // 其他配置
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  });
};

export class ShardingConfig {
  static getShardingRules() {
    return {
      // 订单相关分片规则
      order: {
        shardingKey: 'user_id',
        tableCount: 4,
        strategy: 'hash' // hash, range, time
      },
      
      // 支付相关分片规则
      payment: {
        shardingKey: 'user_id',
        tableCount: 4,
        strategy: 'hash'
      },
      
      // 商品相关分片规则
      product: {
        shardingKey: 'category_id',
        tableCount: 8,
        strategy: 'hash'
      }
    };
  }
  
  // 分片算法实现
  static getShardingAlgorithm() {
    return {
      // 基于用户ID的取模分片
      userHashSharding: (shardingValue: any, tableCount: number) => {
        const userId = parseInt(shardingValue.toString());
        return Math.abs(userId) % tableCount;
      },
      
      // 基于时间范围的分片
      timeRangeSharding: (shardingValue: Date, tableCount: number) => {
        const month = shardingValue.getMonth() + 1;
        const year = shardingValue.getFullYear();
        return (year * 12 + month) % tableCount;
      },
      
      // 基于分类的分片
      categorySharding: (shardingValue: any, tableCount: number) => {
        const categoryId = parseInt(shardingValue.toString());
        return Math.abs(categoryId) % tableCount;
      }
    };
  }
}