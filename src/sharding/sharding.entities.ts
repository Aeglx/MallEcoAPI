import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// 分片基类 - 提供分片相关的通用字段
@Entity()
export abstract class ShardingBaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 分片键字段
  @Column({ type: 'bigint', nullable: false })
  @Index()
  sharding_key: number;

  // 获取分片表名后缀
  getShardingSuffix(tableCount: number = 4): string {
    const algorithm = ShardingConfig.getShardingAlgorithm();
    return algorithm.userHashSharding(this.sharding_key, tableCount).toString();
  }
}

// 订单分片实体
@Entity('orders_{suffix}')
export class OrderShardingEntity extends ShardingBaseEntity {
  @Column({ type: 'varchar', length: 50 })
  order_no: string;

  @Column({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'tinyint', default: 0 })
  status: number;

  @Column({ type: 'text', nullable: true })
  remark: string;

  // 重写分片键为user_id
  getShardingSuffix(tableCount: number = 4): string {
    const algorithm = ShardingConfig.getShardingAlgorithm();
    return algorithm.userHashSharding(this.user_id, tableCount).toString();
  }
}

// 订单项分片实体
@Entity('order_items_{suffix}')
export class OrderItemShardingEntity extends ShardingBaseEntity {
  @Column({ type: 'bigint' })
  order_id: number;

  @Column({ type: 'bigint' })
  product_id: number;

  @Column({ type: 'varchar', length: 200 })
  product_name: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  // 重写分片键为order_id
  getShardingSuffix(tableCount: number = 4): string {
    const algorithm = ShardingConfig.getShardingAlgorithm();
    return algorithm.userHashSharding(this.order_id, tableCount).toString();
  }
}

// 支付记录分片实体
@Entity('payments_{suffix}')
export class PaymentShardingEntity extends ShardingBaseEntity {
  @Column({ type: 'varchar', length: 50 })
  payment_no: string;

  @Column({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'bigint' })
  order_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 20 })
  payment_method: string;

  @Column({ type: 'tinyint', default: 0 })
  status: number;

  @Column({ type: 'datetime', nullable: true })
  paid_at: Date;

  // 重写分片键为user_id
  getShardingSuffix(tableCount: number = 4): string {
    const algorithm = ShardingConfig.getShardingAlgorithm();
    return algorithm.userHashSharding(this.user_id, tableCount).toString();
  }
}

// 分片配置导入
import { ShardingConfig } from './sharding.config';
