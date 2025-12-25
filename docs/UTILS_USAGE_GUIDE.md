# 工具类使用指南

## 📋 概述

本文档介绍MallEcoAPI中可用的工具类及其使用方法。

## 🛠️ 工具类列表

### 1. ResultUtil - 统一响应格式

**位置**: `@shared/utils/result.util`

**功能**: 统一API响应格式

**使用示例**:
```typescript
import { ResultUtil, ResultCode } from '@shared/utils';

// 返回成功数据
return ResultUtil.data({ id: 1, name: '商品' });

// 返回成功消息
return ResultUtil.success();

// 返回失败消息
return ResultUtil.error(ResultCode.NOT_FOUND, '资源不存在');
```

### 2. StringUtil - 字符串工具

**位置**: `@shared/utils/string.util`

**功能**: 字符串操作工具

**使用示例**:
```typescript
import { StringUtil } from '@shared/utils';

// 判断是否为空
if (StringUtil.isEmpty(str)) { }

// 驼峰转下划线
const snake = StringUtil.camelToSnake('userName'); // 'user_name'

// 下划线转驼峰
const camel = StringUtil.snakeToCamel('user_name'); // 'userName'
```

### 3. DateUtil - 日期工具

**位置**: `@shared/utils/date.util`

**功能**: 日期格式化、计算等

**使用示例**:
```typescript
import { DateUtil } from '@shared/utils';

// 格式化日期
const formatted = DateUtil.format(new Date(), 'YYYY-MM-DD HH:mm:ss');

// 日期加减
const tomorrow = DateUtil.addDays(new Date(), 1);

// 计算天数差
const days = DateUtil.diffDays(date1, date2);
```

### 4. BatchQueryUtil - 批量查询工具

**位置**: `@shared/utils/batch-query.util`

**功能**: 优化批量查询性能

**使用示例**:
```typescript
import { BatchQueryUtil } from '@shared/utils';

// 批量加载并映射
const userMap = await BatchQueryUtil.batchLoad(
  userIds,
  (ids) => this.userService.findByIds(ids),
  'id'
);

// 分批查询
const users = await BatchQueryUtil.batchLoadInChunks(
  userIds,
  (ids) => this.userService.findByIds(ids),
  100 // 每批100个
);
```

### 5. CommonUtil - 通用工具

**位置**: `@shared/utils/common.util`

**功能**: 通用工具方法

**使用示例**:
```typescript
import { CommonUtil } from '@shared/utils';

// 生成订单号
const orderSn = CommonUtil.generateOrderSn(); // 'ORDER1234567890123456'

// 生成商品编号
const goodsSn = CommonUtil.generateGoodsSn(); // 'GOODS1234567890123456'

// 文件重命名
const newName = CommonUtil.rename('file.jpg'); // UUID.jpg
```

### 6. UuidUtil - UUID工具

**位置**: `@shared/utils/uuid.util`

**功能**: UUID生成

**使用示例**:
```typescript
import { UuidUtil } from '@shared/utils';

// 生成UUID
const uuid = UuidUtil.uuid(); // 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'

// 生成不带横线的UUID
const uuidNoDash = UuidUtil.uuidWithoutDash();

// 生成随机字符串
const random = UuidUtil.randomString(16);
```

## 📦 统一导入

```typescript
// 从统一入口导入
import {
  ResultUtil,
  ResultCode,
  StringUtil,
  DateUtil,
  BatchQueryUtil,
  CommonUtil,
  UuidUtil,
} from '@shared/utils';
```

## 🎯 最佳实践

1. **统一响应格式**: 使用ResultUtil统一API响应格式
2. **字符串处理**: 使用StringUtil进行字符串操作，避免重复代码
3. **日期处理**: 使用DateUtil进行日期格式化，保持一致性
4. **批量查询**: 使用BatchQueryUtil优化数据库查询性能
5. **ID生成**: 使用CommonUtil或UuidUtil生成唯一标识

---

**最后更新**：2024-12-19

