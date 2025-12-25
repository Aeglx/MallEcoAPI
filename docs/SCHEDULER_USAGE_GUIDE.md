# 分布式定时任务系统使用指南

## 📋 概述

MallEcoAPI提供了基于Redis的分布式定时任务系统，支持延迟任务和定时任务的调度。

## 🎯 特性

- ✅ **分布式支持**: 基于Redis，支持多实例部署
- ✅ **延迟任务**: 支持指定延迟时间执行
- ✅ **定时任务**: 支持指定执行时间
- ✅ **任务管理**: 支持任务的添加、修改、删除
- ✅ **执行器模式**: 可扩展的执行器接口
- ✅ **自动扫描**: 自动扫描并执行到期任务

## 🚀 快速开始

### 1. 创建执行器

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { DelayTaskExecutor } from '@shared/scheduler/interfaces/executor.interface';
import { TimeTriggerMsg } from '@shared/scheduler/interfaces/time-trigger.interface';

@Injectable()
export class MyExecutorService implements DelayTaskExecutor {
  readonly executorName = 'MY_TASK';
  private readonly logger = new Logger(MyExecutorService.name);

  async execute(msg: TimeTriggerMsg): Promise<void> {
    const { param } = msg;
    this.logger.log(`Executing task with param:`, param);
    
    // 实现你的业务逻辑
    // ...
  }
}
```

### 2. 注册执行器

在模块中注册执行器：

```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { SchedulerModule, ExecutorRegistryService } from '@shared/scheduler';
import { MyExecutorService } from './my-executor.service';

@Module({
  imports: [SchedulerModule],
  providers: [MyExecutorService],
})
export class MyModule implements OnModuleInit {
  constructor(
    private readonly executorRegistry: ExecutorRegistryService,
    private readonly myExecutor: MyExecutorService,
  ) {}

  onModuleInit() {
    // 注册执行器
    this.executorRegistry.register(this.myExecutor);
  }
}
```

### 3. 调度任务

```typescript
import { Injectable } from '@nestjs/common';
import { SchedulerService } from '@shared/scheduler';

@Injectable()
export class MyService {
  constructor(private readonly scheduler: SchedulerService) {}

  async scheduleTask() {
    // 延迟30秒执行
    await this.scheduler.schedule(
      'MY_TASK',
      { orderId: '12345' },
      30, // 延迟30秒
    );

    // 指定执行时间
    const triggerTime = Math.floor(Date.now() / 1000) + 3600; // 1小时后
    await this.scheduler.scheduleAt(
      'MY_TASK',
      { orderId: '12345' },
      triggerTime,
    );
  }
}
```

## 📚 API参考

### SchedulerService

#### schedule(executorName, param, delaySeconds, uniqueKey?)

调度延迟任务。

**参数**:
- `executorName`: 执行器名称
- `param`: 任务参数
- `delaySeconds`: 延迟秒数
- `uniqueKey`: 唯一标识（可选）

**示例**:
```typescript
await scheduler.schedule('ORDER_AUTO_CANCEL', { orderId: '123' }, 300);
```

#### scheduleAt(executorName, param, triggerTime, uniqueKey?)

调度定时任务（指定执行时间）。

**参数**:
- `executorName`: 执行器名称
- `param`: 任务参数
- `triggerTime`: 触发时间（时间戳，秒）
- `uniqueKey`: 唯一标识（可选）

**示例**:
```typescript
const triggerTime = Math.floor(Date.now() / 1000) + 3600;
await scheduler.scheduleAt('ORDER_AUTO_CANCEL', { orderId: '123' }, triggerTime);
```

#### cancel(executorName, triggerTime, uniqueKey, topic?)

取消任务。

**示例**:
```typescript
await scheduler.cancel('ORDER_AUTO_CANCEL', triggerTime, uniqueKey);
```

#### getPendingTaskCount()

获取待执行任务数量。

**示例**:
```typescript
const count = await scheduler.getPendingTaskCount();
console.log(`Pending tasks: ${count}`);
```

## 🎨 使用场景

### 1. 订单自动取消

```typescript
@Injectable()
export class OrderService {
  constructor(private readonly scheduler: SchedulerService) {}

  async createOrder(orderData: any) {
    // 创建订单
    const order = await this.orderRepo.save(orderData);

    // 30分钟后自动取消未支付订单
    await this.scheduler.schedule(
      'ORDER_AUTO_CANCEL',
      { orderId: order.id },
      1800, // 30分钟
      `order_${order.id}`, // 唯一标识
    );

    return order;
  }

  async payOrder(orderId: string) {
    // 支付订单
    await this.orderRepo.update(orderId, { status: 'PAID' });

    // 取消自动取消任务
    // 需要保存triggerTime，这里简化处理
    // await this.scheduler.cancel('ORDER_AUTO_CANCEL', triggerTime, `order_${orderId}`);
  }
}
```

### 2. 定时数据统计

```typescript
@Injectable()
export class StatisticsService {
  constructor(private readonly scheduler: SchedulerService) {}

  async scheduleDailyStats() {
    // 每天凌晨2点执行
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0);
    
    const triggerTime = Math.floor(tomorrow.getTime() / 1000);
    
    await this.scheduler.scheduleAt(
      'DAILY_STATS',
      {},
      triggerTime,
      'daily_stats',
    );
  }
}
```

## ⚙️ 配置

### Redis配置

在 `config/.env` 中配置Redis：

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 扫描间隔

默认每5秒扫描一次到期任务，可以在 `RedisTimeTriggerService` 中修改 `SCAN_INTERVAL`。

## 🔍 监控和调试

### 查看待执行任务

```typescript
const count = await scheduler.getPendingTaskCount();
console.log(`Pending tasks: ${count}`);
```

### 日志

系统会记录以下日志：
- 任务添加: `Added delay task: ...`
- 任务执行: `Executing task: ...`
- 任务删除: `Deleted delay task: ...`
- 执行器注册: `Registered executor: ...`

## ⚠️ 注意事项

1. **唯一标识**: 使用`uniqueKey`避免重复任务
2. **执行器注册**: 确保执行器在模块初始化时注册
3. **错误处理**: 执行器中的错误会被记录，但不会阻止其他任务执行
4. **Redis连接**: 确保Redis连接稳定，否则任务可能丢失
5. **时间精度**: 任务执行时间精度为秒级

## 🆚 与@nestjs/schedule的区别

| 特性 | 分布式定时任务 | @nestjs/schedule |
|------|--------------|------------------|
| 分布式支持 | ✅ 是 | ❌ 否 |
| 延迟任务 | ✅ 支持 | ❌ 不支持 |
| 动态任务 | ✅ 支持 | ❌ 不支持 |
| 任务管理 | ✅ 支持 | ❌ 不支持 |
| 配置简单 | ❌ 需要Redis | ✅ 简单 |

**建议**:
- 需要分布式支持或延迟任务时，使用分布式定时任务系统
- 简单的定时任务（如每天执行），可以使用@nestjs/schedule

---

**最后更新**: 2024-12-19

