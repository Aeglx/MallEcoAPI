# 分销系统 API 文档

## 概述

分销系统是MallEco电商系统的重要组成部分，提供了完整的分销员管理、商品分销、订单管理和提现功能。

## 模块结构

```
distribution/
├── entities/          # 实体定义
│   ├── distribution.entity.ts
│   ├── distribution-goods.entity.ts
│   ├── distribution-order.entity.ts
│   └── distribution-cash.entity.ts
├── dto/              # 数据传输对象
│   ├── distribution-apply.dto.ts
│   ├── distribution-goods-search.dto.ts
│   ├── distribution-search.dto.ts
│   └── distribution-order-search.dto.ts
├── enums/            # 枚举定义
│   ├── distribution-status.enum.ts
│   └── distribution-order-status.enum.ts
├── controllers/      # 控制器
│   ├── distribution.controller.ts
│   ├── distribution-goods.controller.ts
│   ├── distribution-order.controller.ts
│   └── distribution-cash.controller.ts
├── services/         # 服务层
│   ├── distribution.service.ts
│   ├── distribution-goods.service.ts
│   ├── distribution-order.service.ts
│   └── distribution-cash.service.ts
├── mappers/          # 数据映射器
└── distribution.module.ts
```

## API 端点总览

### 分销员管理 (10个端点)

#### 基础管理
- `POST /distribution/apply` - 申请成为分销员
- `GET /distribution/current` - 获取当前用户的分销员信息
- `GET /distribution/binding/:distributionId` - 绑定分销员

#### 审核与管理
- `PUT /distribution/audit/:id` - 审核分销员申请
- `GET /distribution/list` - 获取分销员分页列表
- `GET /distribution/:id` - 根据ID获取分销员信息
- `PUT /distribution/:id` - 更新分销员信息
- `PUT /distribution/toggle/:id` - 启用/禁用分销员
- `DELETE /distribution/:id` - 删除分销员

#### 统计信息
- `GET /distribution/statistics/overview` - 获取分销员统计信息

### 分销商品管理 (10个端点)

#### 商品管理
- `POST /distribution-goods` - 创建分销商品
- `POST /distribution-goods/batch` - 批量创建分销商品
- `GET /distribution-goods/list` - 获取分销商品分页列表
- `GET /distribution-goods/:id` - 根据ID获取分销商品
- `PUT /distribution-goods/:id` - 更新分销商品
- `DELETE /distribution-goods/:id` - 删除分销商品

#### 查询接口
- `GET /distribution-goods/sku/:skuId` - 根据SKU获取分销商品
- `GET /distribution-goods/store/:storeId` - 获取店铺的分销商品列表
- `GET /distribution-goods/goods/:goodsId` - 根据商品ID获取分销商品列表
- `GET /distribution-goods/check/:skuId` - 检查SKU是否为分销商品

#### 统计信息
- `GET /distribution-goods/statistics/overview` - 获取分销商品统计信息

### 分销订单管理 (8个端点)

#### 订单查询
- `GET /distribution-order/page` - 获取分销员分页订单列表
- `GET /distribution-order/:id` - 根据ID获取分销订单
- `GET /distribution-order/distribution/:distributionId` - 根据分销员ID获取订单列表
- `GET /distribution-order/order/:orderSn` - 根据订单编号获取分销订单

#### 订单管理
- `PUT /distribution-order/status/:id` - 更新分销订单状态
- `PUT /distribution-order/refund/:orderItemSn` - 处理分销订单退款

#### 统计信息
- `GET /distribution-order/statistics/overview` - 获取分销订单统计信息

### 分销提现管理 (7个端点)

#### 提现申请
- `POST /distribution-cash/apply` - 申请提现
- `GET /distribution-cash/current/list` - 获取当前用户的提现记录

#### 提现审核
- `PUT /distribution-cash/audit/:id` - 审核提现申请

#### 查询接口
- `GET /distribution-cash/:id` - 获取提现申请详情
- `GET /distribution-cash/distribution/:distributionId` - 获取分销员的提现记录
- `GET /distribution-cash/list` - 分页查询提现记录

#### 统计信息
- `GET /distribution-cash/statistics/overview` - 获取提现统计信息

## 数据模型

### 分销员 (Distribution)
```typescript
{
  id: string;                    // 分销员ID
  memberId: string;              // 会员ID
  memberName: string;            // 会员名称
  name: string;                  // 会员姓名
  idNumber: string;              // 身份证号
  rebateTotal: number;           // 分销总额
  canRebate: number;             // 可提现金额
  commissionFrozen: number;      // 冻结金额
  distributionOrderCount: number; // 分销订单数
  distributionStatus: enum;      // 分销员状态
  settlementBankAccountName: string; // 结算银行开户行名称
  settlementBankAccountNum: string;  // 结算银行开户账号
  settlementBankBranchName: string; // 结算银行开户支行名称
  distributionOrderPrice: number;   // 分销订单金额
}
```

### 分销商品 (DistributionGoods)
```typescript
{
  id: string;                    // 分销商品ID
  goodsId: string;               // 商品ID
  goodsName: string;             // 商品名称
  skuId: string;                 // 规格ID
  specs: string;                 // 规格信息json
  storeId: string;               // 店铺ID
  storeName: string;             // 店铺名称
  commission: number;            // 佣金金额
  price: number;                 // 商品价格
  thumbnail: string;             // 缩略图路径
  quantity: number;              // 库存
}
```

### 分销订单 (DistributionOrder)
```typescript
{
  id: string;                    // 分销订单ID
  distributionOrderStatus: enum; // 分销订单状态
  memberId: string;              // 购买会员的id
  memberName: string;            // 购买会员的名称
  distributionId: string;        // 分销员id
  distributionName: string;      // 分销员名称
  settleCycle: Date;             // 解冻日期
  rebate: number;                // 提成金额
  sellBackRebate: number;        // 退款金额
  storeId: string;               // 店铺id
  storeName: string;             // 店铺名称
  orderSn: string;               // 订单编号
  orderItemSn: string;           // 子订单编号
  goodsId: string;               // 商品ID
  goodsName: string;             // 商品名称
  skuId: string;                 // 货品ID
  specs: string;                 // 规格
  image: string;                 // 图片
  num: number;                   // 商品数量
  refundNum: number;             // 退款商品数量
}
```

### 分销提现 (DistributionCash)
```typescript
{
  id: string;                    // 提现申请ID
  distributionId: string;        // 分销员ID
  distributionName: string;      // 分销员名称
  cashAmount: number;            // 提现金额
  cashSerialNo: string;          // 提现流水号
  bankAccountName: string;       // 银行开户名
  bankAccountNum: string;        // 银行账号
  bankBranchName: string;        // 开户支行名称
  cashStatus: enum;              // 提现状态
  auditRemark: string;           // 审核备注
  auditTime: Date;               // 审核时间
  auditBy: string;               // 审核人
}
```

## 枚举值

### 分销员状态 (DistributionStatusEnum)
- `APPLY` - 申请中
- `PASS` - 已通过
- `REFUSE` - 已拒绝
- `DISABLE` - 已禁用

### 分销订单状态 (DistributionOrderStatusEnum)
- `NO_COMPLETED` - 未完成
- `COMPLETED` - 已完成
- `CANCELLED` - 已取消
- `REFUNDED` - 已退款

### 分销提现状态 (DistributionCashStatusEnum)
- `PENDING` - 待审核
- `APPROVED` - 已通过
- `REJECTED` - 已拒绝
- `COMPLETED` - 已完成
- `CANCELLED` - 已取消

## 数据库表

- `li_distribution` - 分销员表
- `li_distribution_goods` - 分销商品表
- `li_distribution_order` - 分销订单表
- `li_distribution_cash` - 分销提现表

## 业务流程

### 分销员申请流程
1. 用户提交分销员申请
2. 管理员审核申请
3. 审核通过后，用户成为分销员
4. 分销员可以进行分销推广

### 分销商品设置流程
1. 商家设置商品为分销商品
2. 设置分销佣金
3. 分销员可以选择商品进行推广
4. 用户通过分销员链接购买商品

### 分销订单流程
1. 用户通过分销员链接下单
2. 系统生成分销订单
3. 订单完成后，佣金计算
4. 佣金进入冻结状态
5. 解冻后可提现

### 提现流程
1. 分销员申请提现
2. 管理员审核提现申请
3. 审核通过后进行转账
4. 完成提现流程

## 注意事项

1. 所有API接口都需要JWT认证
2. 分销员只能查看自己的订单和提现记录
3. 管理员可以查看所有数据
4. 数据采用软删除，deleteFlag为true表示已删除
5. 金额字段使用decimal类型，保证精度
6. 分销员状态变更需要记录操作日志