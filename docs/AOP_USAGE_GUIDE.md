# AOP模块使用指南

## 📋 概述

AOP模块提供了防重复提交和限流点功能，通过装饰器方式使用，简单易用。

## 🎯 防重复提交

### 使用场景

防止用户重复点击提交按钮，导致重复创建订单、重复支付等问题。

### 使用方法

```typescript
import { Controller, Post } from '@nestjs/common';
import { PreventDuplicateSubmissions } from '@shared/aop/decorators/prevent-duplicate-submissions.decorator';

@Controller('orders')
export class OrdersController {
  @Post('create')
  @PreventDuplicateSubmissions({ expire: 5 }) // 5秒内防重复提交
  async createOrder(@Body() orderData: any) {
    // 创建订单逻辑
  }

  @Post('pay')
  @PreventDuplicateSubmissions({ expire: 10, userIsolation: true }) // 10秒内防重复，用户隔离
  async payOrder(@Body() payData: any) {
    // 支付逻辑
  }
}
```

### 参数说明

- `expire`: 过期时间（秒），默认3秒
- `userIsolation`: 用户间隔离，默认false。如果为true则按用户隔离，需要用户登录状态

## 🔒 限流点

### 使用场景

对特定接口进行限流，防止接口被频繁调用。

### 使用方法

```typescript
import { Controller, Get } from '@nestjs/common';
import { LimitPoint, LimitTypeEnum } from '@shared/aop/decorators/limit-point.decorator';

@Controller('goods')
export class GoodsController {
  @Get('search')
  @LimitPoint({ 
    limit: 100,        // 最多100次
    period: 60,        // 60秒内
    limitType: LimitTypeEnum.IP  // 按IP限流
  })
  async search(@Query() query: any) {
    // 搜索逻辑
  }

  @Get('detail/:id')
  @LimitPoint({ 
    limit: 10, 
    period: 60,
    prefix: 'goods',
    key: 'detail',
    limitType: LimitTypeEnum.IP
  })
  async getDetail(@Param('id') id: string) {
    // 获取详情逻辑
  }
}
```

### 参数说明

- `name`: 资源的名字（可选）
- `key`: 资源的key（可选）
- `prefix`: Key的prefix redis前缀（可选）
- `period`: 给定的时间段，单位秒，默认60
- `limit`: 最多的访问限制次数，默认10
- `limitType`: 类型，IP限制还是自定义key值限制，默认IP

## 📝 注意事项

1. **防重复提交**：
   - 基于请求方法和路径+请求体生成key
   - 如果启用用户隔离，会加上用户ID
   - 使用缓存存储，过期后自动清除

2. **限流点**：
   - 使用缓存计数
   - 支持IP限流和自定义key限流
   - 超过限制会抛出 `TOO_MANY_REQUESTS` 异常

3. **性能考虑**：
   - 所有拦截器都是全局的，但只对有装饰器的方法生效
   - 使用缓存管理器，性能影响很小

## 🎨 最佳实践

1. **防重复提交**：
   - 创建、更新、删除操作建议使用
   - 支付、下单等关键操作必须使用
   - 根据业务场景设置合理的过期时间

2. **限流点**：
   - 搜索、查询等接口可以使用
   - 登录、注册等接口建议使用
   - 根据接口特点设置合理的限流参数

## 📚 示例

### 完整示例

```typescript
import { Controller, Post, Get } from '@nestjs/common';
import { 
  PreventDuplicateSubmissions,
  LimitPoint,
  LimitTypeEnum 
} from '@shared/aop/decorators';

@Controller('orders')
export class OrdersController {
  // 创建订单 - 防重复提交
  @Post('create')
  @PreventDuplicateSubmissions({ expire: 5 })
  async create(@Body() orderData: any) {
    // ...
  }

  // 支付订单 - 防重复提交 + 限流
  @Post('pay')
  @PreventDuplicateSubmissions({ expire: 10, userIsolation: true })
  @LimitPoint({ limit: 5, period: 60, limitType: LimitTypeEnum.IP })
  async pay(@Body() payData: any) {
    // ...
  }

  // 查询订单列表 - 限流
  @Get('list')
  @LimitPoint({ limit: 100, period: 60 })
  async list(@Query() query: any) {
    // ...
  }
}
```

---

**最后更新**：2024-12-19

