# MallEcoAPI 接口规范文档

## 1. 规范概述

### 1.1 设计原则
- **完全兼容Java版API**，确保前端无需修改
- **RESTful风格**，统一接口设计
- **标准化响应格式**，便于前端处理
- **完善的错误处理**，提供明确的错误信息
- **版本控制支持**，便于接口升级

### 1.2 技术规范
- **协议**: HTTP/HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **API版本**: v1 (基础路径: /api/v1)
- **认证方式**: JWT Bearer Token

## 2. 通用规范

### 2.1 请求格式

#### 2.1.1 URL结构
```
https://domain.com/api/v1/{module}/{resource}/{action}?{parameters}
```

**示例:**
```
GET  /api/v1/buyer/order/list
POST /api/v1/buyer/order/create
PUT  /api/v1/buyer/order/update/{orderId}
DELETE /api/v1/buyer/order/delete/{orderId}
```

#### 2.1.2 HTTP方法使用规范

| HTTP方法 | 用途 | 示例 |
|----------|------|------|
| GET | 查询资源 | GET /api/v1/product/{id} |
| POST | 创建资源 | POST /api/v1/product |
| PUT | 更新资源(完整更新) | PUT /api/v1/product/{id} |
| PATCH | 更新资源(部分更新) | PATCH /api/v1/product/{id} |
| DELETE | 删除资源 | DELETE /api/v1/product/{id} |

#### 2.1.3 请求头规范
```http
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-Request-ID: {unique_request_id}
X-Client-Version: {client_version}
X-Timestamp: {unix_timestamp}
```

#### 2.1.4 请求体格式
```typescript
// 标准请求格式
interface StandardRequest<T> {
  data?: T;           // 请求业务数据
  params?: any;       // URL参数
  query?: any;        // 查询参数
}

// 分页请求格式
interface PaginationRequest<T> extends StandardRequest<T> {
  query: {
    page: number;      // 页码，从1开始
    limit: number;     // 每页数量，默认20，最大100
    sortBy?: string;   // 排序字段
    sortOrder?: 'ASC' | 'DESC'; // 排序方向
  };
}

// 批量操作请求格式
interface BatchRequest<T> extends StandardRequest<T> {
  data: {
    items: T[];        // 批量操作数据项
    batchSize?: number; // 批次大小，默认100
  };
}
```

### 2.2 响应格式

#### 2.2.1 标准响应格式
```typescript
interface StandardResponse<T> {
  code: number;       // 业务状态码
  message: string;     // 响应消息
  data?: T;           // 响应数据
  timestamp: number;   // 响应时间戳
  traceId: string;     // 请求追踪ID
}

// 成功响应示例
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": "uuid-string",
    "name": "商品名称"
  },
  "timestamp": 1703980800000,
  "traceId": "req_123456789"
}

// 错误响应示例
{
  "code": 400,
  "message": "参数错误",
  "data": {
    "field": "email",
    "error": "邮箱格式不正确"
  },
  "timestamp": 1703980800000,
  "traceId": "req_123456789"
}
```

#### 2.2.2 分页响应格式
```typescript
interface PaginationResponse<T> extends StandardResponse<{
  items: T[];         // 数据列表
  pagination: {
    page: number;      // 当前页码
    limit: number;     // 每页数量
    total: number;     // 总记录数
    totalPages: number; // 总页数
    hasNext: boolean;  // 是否有下一页
    hasPrev: boolean;  // 是否有上一页
  };
}> {}

// 分页响应示例
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "items": [
      { "id": "1", "name": "商品1" },
      { "id": "2", "name": "商品2" }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": 1703980800000,
  "traceId": "req_123456789"
}
```

### 2.3 状态码规范

#### 2.3.1 HTTP状态码映射
```typescript
const HTTP_STATUS_MAPPING = {
  // 成功响应
  OK: 200,           // 请求成功
  CREATED: 201,      // 资源创建成功
  ACCEPTED: 202,     // 请求已接受，异步处理中
  NO_CONTENT: 204,    // 请求成功，无返回内容
  
  // 客户端错误
  BAD_REQUEST: 400,  // 请求参数错误
  UNAUTHORIZED: 401, // 未授权
  FORBIDDEN: 403,    // 禁止访问
  NOT_FOUND: 404,    // 资源不存在
  METHOD_NOT_ALLOWED: 405, // 方法不允许
  CONFLICT: 409,     // 资源冲突
  UNPROCESSABLE_ENTITY: 422, // 请求格式正确但语义错误
  TOO_MANY_REQUESTS: 429,   // 请求过于频繁
  
  // 服务端错误
  INTERNAL_SERVER_ERROR: 500, // 服务器内部错误
  BAD_GATEWAY: 502,          // 网关错误
  SERVICE_UNAVAILABLE: 503,  // 服务不可用
  GATEWAY_TIMEOUT: 504       // 网关超时
};
```

#### 2.3.2 业务状态码定义
```typescript
enum BusinessCode {
  // 通用状态码 (200-299)
  SUCCESS = 200,              // 操作成功
  CREATED = 201,              // 创建成功
  UPDATED = 202,              // 更新成功
  DELETED = 203,              // 删除成功
  
  // 参数错误 (400-499)
  INVALID_PARAMS = 400,       // 参数错误
  MISSING_PARAMS = 401,       // 缺少参数
  INVALID_FORMAT = 402,       // 格式错误
  PARAMS_OUT_OF_RANGE = 403, // 参数超出范围
  
  // 权限错误 (500-599)
  UNAUTHORIZED = 500,         // 未授权
  FORBIDDEN = 501,            // 禁止访问
  TOKEN_EXPIRED = 502,        // Token过期
  TOKEN_INVALID = 503,        // Token无效
  
  // 业务错误 (600-999)
  USER_NOT_FOUND = 600,       // 用户不存在
  USER_DISABLED = 601,        // 用户已禁用
  PASSWORD_INCORRECT = 602,   // 密码错误
  
  PRODUCT_NOT_FOUND = 700,    // 商品不存在
  PRODUCT_OUT_OF_STOCK = 701, // 商品库存不足
  PRODUCT_OFF_SHELF = 702,    // 商品已下架
  
  ORDER_NOT_FOUND = 800,      // 订单不存在
  ORDER_STATUS_INVALID = 801, // 订单状态无效
  ORDER_CANNOT_CANCEL = 802,  // 订单无法取消
  
  PAYMENT_FAILED = 900,       // 支付失败
  PAYMENT_TIMEOUT = 901,      // 支付超时
  PAYMENT_CANCELLED = 902,    // 支付已取消
  
  // 系统错误 (1000+)
  SYSTEM_ERROR = 1000,        // 系统错误
  DATABASE_ERROR = 1001,      // 数据库错误
  EXTERNAL_SERVICE_ERROR = 1002, // 外部服务错误
  NETWORK_ERROR = 1003,       // 网络错误
}
```

## 3. 模块接口规范

### 3.1 买家端接口 (Buyer)

#### 3.1.1 用户认证模块
```typescript
// 用户登录
POST /api/v1/buyer/auth/login
Request: {
  data: {
    username: string;
    password: string;
    captcha?: string;
    captchaKey?: string;
  }
}
Response: {
  code: number;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    userInfo: {
      id: string;
      username: string;
      nickname: string;
      avatar: string;
      mobile: string;
      email: string;
    };
    expiresIn: number;
  };
}

// 用户注册
POST /api/v1/buyer/auth/register
Request: {
  data: {
    username: string;
    password: string;
    mobile: string;
    email: string;
    captcha: string;
    captchaKey: string;
  }
}
Response: {
  code: number;
  message: string;
  data: {
    userId: string;
    token: string;
    userInfo: UserInfo;
  };
}

// 刷新Token
POST /api/v1/buyer/auth/refresh
Request: {
  data: {
    refreshToken: string;
  }
}
Response: {
  code: number;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
}

// 退出登录
POST /api/v1/buyer/auth/logout
Request: {
  data: {
    token: string;
  }
}
Response: {
  code: number;
  message: string;
}
```

#### 3.1.2 商品模块
```typescript
// 商品列表查询
GET /api/v1/buyer/product/list
Query: {
  page?: number;
  limit?: number;
  categoryId?: string;
  brandId?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createTime' | 'price' | 'sales' | 'rating';
  sortOrder?: 'ASC' | 'DESC';
}
Response: {
  code: number;
  message: string;
  data: {
    items: Product[];
    pagination: PaginationInfo;
    filters: {
      categories: Category[];
      brands: Brand[];
      priceRanges: PriceRange[];
    };
  };
}

// 商品详情查询
GET /api/v1/buyer/product/detail/{productId}
Response: {
  code: number;
  message: string;
  data: {
    productInfo: ProductDetail;
    skuList: ProductSku[];
    specifications: Specification[];
    reviews: Review[];
    recommendation: Product[];
  };
}

// 商品搜索
GET /api/v1/buyer/product/search
Query: {
  keyword: string;
  page?: number;
  limit?: number;
  filters?: SearchFilter;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
Response: {
  code: number;
  message: string;
  data: {
    items: Product[];
    pagination: PaginationInfo;
    suggestions: string[];
    aggregations: AggregationResult[];
  };
}
```

#### 3.1.3 购物车模块
```typescript
// 添加商品到购物车
POST /api/v1/buyer/cart/add
Request: {
  data: {
    skuId: string;
    quantity: number;
  };
}
Response: {
  code: number;
  message: string;
  data: {
    cartId: string;
    cartItemId: string;
  };
}

// 购物车列表
GET /api/v1/buyer/cart/list
Response: {
  code: number;
  message: string;
  data: {
    items: CartItem[];
    summary: {
      totalItems: number;
      totalAmount: number;
      totalDiscount: number;
      finalAmount: number;
    };
    promotions: Promotion[];
  };
}

// 更新购物车商品数量
PUT /api/v1/buyer/cart/update/{cartItemId}
Request: {
  data: {
    quantity: number;
  };
}
Response: {
  code: number;
  message: string;
  data: CartItem;
}

// 删除购物车商品
DELETE /api/v1/buyer/cart/delete/{cartItemId}
Response: {
  code: number;
  message: string;
}

// 清空购物车
DELETE /api/v1/buyer/cart/clear
Response: {
  code: number;
  message: string;
}
```

### 3.2 卖家端接口 (Seller)

#### 3.2.1 店铺管理模块
```typescript
// 店铺信息查询
GET /api/v1/seller/store/info
Response: {
  code: number;
  message: string;
  data: StoreInfo;
}

// 店铺信息更新
PUT /api/v1/seller/store/info
Request: {
  data: Partial<StoreInfo>;
}
Response: {
  code: number;
  message: string;
  data: StoreInfo;
}

// 店铺设置查询
GET /api/v1/seller/store/settings
Response: {
  code: number;
  message: string;
  data: StoreSettings;
}

// 店铺设置更新
PUT /api/v1/seller/store/settings
Request: {
  data: Partial<StoreSettings>;
}
Response: {
  code: number;
  message: string;
}
```

#### 3.2.2 商品管理模块
```typescript
// 商品创建
POST /api/v1/seller/product/create
Request: {
  data: {
    basicInfo: ProductBasicInfo;
    skuList: ProductSku[];
    specifications: Specification[];
    description: string;
    images: string[];
    categoryId: string;
    brandId?: string;
  };
}
Response: {
  code: number;
  message: string;
  data: {
    productId: string;
    productNo: string;
  };
}

// 商品列表查询
GET /api/v1/seller/product/list
Query: {
  page?: number;
  limit?: number;
  keyword?: string;
  categoryId?: string;
  status?: ProductStatus;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
Response: {
  code: number;
  message: string;
  data: {
    items: Product[];
    pagination: PaginationInfo;
    summary: ProductSummary;
  };
}

// 商品详情更新
PUT /api/v1/seller/product/update/{productId}
Request: {
  data: Partial<ProductUpdateInfo>;
}
Response: {
  code: number;
  message: string;
  data: Product;
}

// 商品上下架
PUT /api/v1/seller/product/status/{productId}
Request: {
  data: {
    status: ProductStatus;
    reason?: string;
  };
}
Response: {
  code: number;
  message: string;
}

// 商品删除
DELETE /api/v1/seller/product/delete/{productId}
Response: {
  code: number;
  message: string;
}
```

### 3.3 管理端接口 (Manager)

#### 3.3.1 用户管理模块
```typescript
// 用户列表查询
GET /api/v1/manager/user/list
Query: {
  page?: number;
  limit?: number;
  keyword?: string;
  userType?: 'buyer' | 'seller' | 'admin';
  status?: UserStatus;
  registerTimeStart?: string;
  registerTimeEnd?: string;
}
Response: {
  code: number;
  message: string;
  data: {
    items: User[];
    pagination: PaginationInfo;
    summary: UserSummary;
  };
}

// 用户详情查询
GET /api/v1/manager/user/detail/{userId}
Response: {
  code: number;
  message: string;
  data: UserDetail;
}

// 用户状态更新
PUT /api/v1/manager/user/status/{userId}
Request: {
  data: {
    status: UserStatus;
    reason?: string;
  };
}
Response: {
  code: number;
  message: string;
}

// 用户删除
DELETE /api/v1/manager/user/delete/{userId}
Response: {
  code: number;
  message: string;
}
```

### 3.4 公共模块 (Common)

#### 3.4.1 文件上传模块
```typescript
// 文件上传
POST /api/v1/common/upload
Request: FormData {
  file: File;
  type: 'image' | 'video' | 'document';
  category?: string;
}
Response: {
  code: number;
  message: string;
  data: {
    fileId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadTime: string;
  };
}

// 批量文件上传
POST /api/v1/common/upload/batch
Request: FormData {
  files: File[];
  type: 'image' | 'video' | 'document';
  category?: string;
}
Response: {
  code: number;
  message: string;
  data: UploadResult[];
}
```

## 4. 数据类型定义

### 4.1 通用数据类型

#### 4.1.1 分页信息
```typescript
interface PaginationInfo {
  page: number;          // 当前页码
  limit: number;         // 每页数量
  total: number;         // 总记录数
  totalPages: number;    // 总页数
  hasNext: boolean;      // 是否有下一页
  hasPrev: boolean;      // 是否有上一页
}
```

#### 4.1.2 时间范围
```typescript
interface DateRange {
  startTime: string;      // 开始时间 (ISO 8601)
  endTime: string;        // 结束时间 (ISO 8601)
}
```

#### 4.1.3 地址信息
```typescript
interface Address {
  id: string;
  receiverName: string;  // 收货人姓名
  receiverMobile: string; // 收货人手机
  province: string;       // 省份
  city: string;          // 城市
  district: string;      // 区县
  address: string;       // 详细地址
  zipCode?: string;      // 邮政编码
  isDefault: boolean;    // 是否默认地址
}
```

### 4.2 业务数据类型

#### 4.2.1 商品相关
```typescript
// 商品基础信息
interface Product {
  id: string;
  productNo: string;     // 商品编号
  name: string;          // 商品名称
  subtitle?: string;     // 商品副标题
  description: string;   // 商品描述
  images: string[];      // 商品图片
  video?: string;        // 商品视频
  categoryId: string;    // 分类ID
  brandId?: string;      // 品牌ID
  price: number;        // 商品价格
  originalPrice?: number; // 原价
  costPrice?: number;    // 成本价
  stock: number;         // 库存数量
  sales: number;         // 销售数量
  views: number;         // 浏览次数
  rating: number;        // 评分
  reviewCount: number;   // 评价数量
  status: ProductStatus; // 商品状态
  tags: string[];        // 商品标签
  specifications: Specification[]; // 规格信息
  skuList: ProductSku[]; // SKU列表
  createTime: string;
  updateTime: string;
}

// 商品SKU
interface ProductSku {
  id: string;
  productId: string;
  skuNo: string;         // SKU编号
  specs: SpecValue[];    // 规格值组合
  price: number;         // SKU价格
  originalPrice?: number; // 原价
  stock: number;         // SKU库存
  image?: string;        // SKU图片
  barcode?: string;      // 条形码
  weight?: number;       // 重量
  volume?: number;       // 体积
  status: SkuStatus;
}

// 规格定义
interface Specification {
  id: string;
  name: string;          // 规格名称
  values: SpecValue[];   // 规格值
  required: boolean;     // 是否必选
  multiple: boolean;     // 是否多选
}

// 规格值
interface SpecValue {
  id: string;
  specId: string;
  value: string;         // 规格值
  image?: string;        // 规格图片
  sort: number;         // 排序
}

// 商品状态枚举
enum ProductStatus {
  DRAFT = 'DRAFT',       // 草稿
  PENDING = 'PENDING',   // 待审核
  APPROVED = 'APPROVED', // 已审核
  REJECTED = 'REJECTED', // 已拒绝
  ON_SALE = 'ON_SALE',   // 上架
  OFF_SALE = 'OFF_SALE', // 下架
  DELETED = 'DELETED'    // 已删除
}
```

#### 4.2.2 订单相关
```typescript
// 订单主表
interface Order {
  id: string;
  orderNo: string;       // 订单编号
  memberId: string;      // 会员ID
  storeId: string;       // 店铺ID
  orderType: OrderType;  // 订单类型
  status: OrderStatus;   // 订单状态
  totalAmount: number;   // 订单总金额
  discountAmount: number; // 优惠金额
  shippingAmount: number; // 运费
  payAmount: number;      // 实付金额
  paymentMethod: PaymentMethod; // 支付方式
  paymentStatus: PaymentStatus;  // 支付状态
  shippingStatus: ShippingStatus; // 物流状态
  address: Address;      // 收货地址
  items: OrderItem[];    // 订单项
  createTime: string;
  updateTime: string;
  paymentTime?: string;
  shippingTime?: string;
  finishTime?: string;
}

// 订单项
interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  skuId: string;
  productName: string;
  skuName: string;
  productImage: string;
  price: number;         // 商品单价
  quantity: number;      // 购买数量
  totalAmount: number;   // 小计金额
  discountAmount: number; // 优惠金额
  finalAmount: number;    // 实付金额
}

// 订单类型
enum OrderType {
  NORMAL = 'NORMAL',     // 普通订单
  GROUP = 'GROUP',       // 拼团订单
  SECKILL = 'SECKILL',   // 秒杀订单
  KANJIA = 'KANJIA',     // 砍价订单
  POINTS = 'POINTS'      // 积分订单
}

// 订单状态
enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT', // 待付款
  PENDING_SHIPPING = 'PENDING_SHIPPING', // 待发货
  SHIPPED = 'SHIPPED',     // 已发货
  DELIVERED = 'DELIVERED', // 已收货
  COMPLETED = 'COMPLETED', // 已完成
  CANCELLED = 'CANCELLED', // 已取消
  REFUNDING = 'REFUNDING', // 退款中
  REFUNDED = 'REFUNDED'    // 已退款
}
```

#### 4.2.3 用户相关
```typescript
// 用户信息
interface User {
  id: string;
  username: string;       // 用户名
  nickname: string;       // 昵称
  avatar: string;         // 头像
  mobile: string;         // 手机号
  email: string;          // 邮箱
  gender: Gender;         // 性别
  birthday?: string;      // 生日
  status: UserStatus;     // 用户状态
  userType: UserType;      // 用户类型
  createTime: string;
  lastLoginTime?: string;
}

// 用户状态
enum UserStatus {
  ACTIVE = 'ACTIVE',       // 活跃
  INACTIVE = 'INACTIVE',   // 不活跃
  DISABLED = 'DISABLED',   // 已禁用
  FROZEN = 'FROZEN',       // 已冻结
  DELETED = 'DELETED'     // 已删除
}

// 用户类型
enum UserType {
  BUYER = 'BUYER',         // 买家
  SELLER = 'SELLER',       // 卖家
  ADMIN = 'ADMIN'          // 管理员
}

// 性别
enum Gender {
  MALE = 'MALE',           // 男
  FEMALE = 'FEMALE',       // 女
  UNKNOWN = 'UNKNOWN'      // 未知
}
```

## 5. 错误处理规范

### 5.1 错误响应格式

#### 5.1.1 参数错误
```typescript
// 单个参数错误
{
  "code": 400,
  "message": "参数错误",
  "data": {
    "field": "email",
    "error": "邮箱格式不正确",
    "value": "invalid-email"
  }
}

// 多个参数错误
{
  "code": 400,
  "message": "参数错误",
  "data": {
    "errors": [
      {
        "field": "email",
        "error": "邮箱不能为空",
        "value": null
      },
      {
        "field": "password",
        "error": "密码长度至少8位",
        "value": "123"
      }
    ]
  }
}
```

#### 5.1.2 业务错误
```typescript
// 业务逻辑错误
{
  "code": 701,
  "message": "商品库存不足",
  "data": {
    "productId": "prod-123",
    "skuId": "sku-456",
    "requestQuantity": 10,
    "availableStock": 5
  }
}

// 权限错误
{
  "code": 501,
  "message": "禁止访问",
  "data": {
    "resource": "/api/v1/admin/user/delete",
    "action": "DELETE",
    "reason": "没有删除用户权限"
  }
}
```

#### 5.1.3 系统错误
```typescript
// 数据库错误
{
  "code": 1001,
  "message": "系统繁忙，请稍后再试",
  "data": {
    "errorType": "DATABASE_ERROR",
    "timestamp": "2024-01-01T12:00:00Z",
    "traceId": "req_123456789"
  }
}

// 外部服务错误
{
  "code": 1002,
  "message": "支付服务暂时不可用",
  "data": {
    "service": "PaymentService",
    "error": "Connection timeout",
    "retryAfter": 60
  }
}
```

### 5.2 错误码对照表

| 错误码 | 错误类型 | HTTP状态码 | 描述 | 示例场景 |
|--------|----------|------------|------|----------|
| 400 | INVALID_PARAMS | 400 | 参数错误 | 邮箱格式不正确 |
| 401 | MISSING_PARAMS | 400 | 缺少参数 | 缺少用户名 |
| 402 | INVALID_FORMAT | 400 | 格式错误 | 日期格式错误 |
| 403 | PARAMS_OUT_OF_RANGE | 400 | 参数超出范围 | 年龄超出有效范围 |
| 500 | UNAUTHORIZED | 401 | 未授权 | Token无效 |
| 501 | FORBIDDEN | 403 | 禁止访问 | 无权限访问资源 |
| 502 | TOKEN_EXPIRED | 401 | Token过期 | 登录超时 |
| 503 | TOKEN_INVALID | 401 | Token无效 | Token被篡改 |
| 600 | USER_NOT_FOUND | 404 | 用户不存在 | 用户ID不存在 |
| 601 | USER_DISABLED | 403 | 用户已禁用 | 账号被禁用 |
| 602 | PASSWORD_INCORRECT | 400 | 密码错误 | 登录密码错误 |
| 700 | PRODUCT_NOT_FOUND | 404 | 商品不存在 | 商品ID不存在 |
| 701 | PRODUCT_OUT_OF_STOCK | 400 | 库存不足 | 商品库存不足 |
| 702 | PRODUCT_OFF_SHELF | 400 | 商品已下架 | 商品已下架 |
| 800 | ORDER_NOT_FOUND | 404 | 订单不存在 | 订单ID不存在 |
| 801 | ORDER_STATUS_INVALID | 400 | 订单状态无效 | 当前状态无法执行操作 |
| 802 | ORDER_CANNOT_CANCEL | 400 | 订单无法取消 | 订单已发货 |
| 900 | PAYMENT_FAILED | 400 | 支付失败 | 支付渠道错误 |
| 901 | PAYMENT_TIMEOUT | 408 | 支付超时 | 支付未在规定时间内完成 |
| 902 | PAYMENT_CANCELLED | 400 | 支付已取消 | 用户主动取消支付 |
| 1000 | SYSTEM_ERROR | 500 | 系统错误 | 未知系统错误 |
| 1001 | DATABASE_ERROR | 500 | 数据库错误 | 数据库连接失败 |
| 1002 | EXTERNAL_SERVICE_ERROR | 502 | 外部服务错误 | 第三方服务不可用 |
| 1003 | NETWORK_ERROR | 503 | 网络错误 | 网络连接失败 |

## 6. 安全规范

### 6.1 认证授权

#### 6.1.1 JWT Token规范
```typescript
// JWT Payload
interface JWTPayload {
  sub: string;           // 用户ID
  username: string;      // 用户名
  userType: UserType;   // 用户类型
  permissions: string[]; // 权限列表
  iat: number;          // 签发时间
  exp: number;          // 过期时间
  jti: string;          // Token ID
}

// Token刷新策略
const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRES_IN: '7d',    // 访问Token有效期
  REFRESH_TOKEN_EXPIRES_IN: '30d',  // 刷新Token有效期
  REFRESH_THRESHOLD: 86400,         // 刷新阈值(24小时)
};
```

#### 6.1.2 权限控制
```typescript
// 权限装饰器使用
@Roles('ADMIN', 'MANAGER')
@Permission('user:delete')
@Delete('/user/:id')
async deleteUser(@Param('id') id: string) {
  return this.userService.deleteUser(id);
}

// 权限检查中间件
@Injectable()
export class PermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler()
    );
    
    return this.checkPermissions(request.user, requiredPermissions);
  }
}
```

### 6.2 数据安全

#### 6.2.1 敏感数据处理
```typescript
// 敏感数据脱敏
interface SensitiveData {
  mobile: string;        // 手机号脱敏: 138****5678
  email: string;         // 邮箱脱敏: a***@domain.com
  idCard: string;        // 身份证脱敏: 110***********1234
  bankCard: string;      // 银行卡脱敏: 6222********1234
}

// 数据加密传输
interface EncryptionConfig {
  algorithm: 'AES-256-GCM'; // 加密算法
  keyExchange: 'RSA-2048';  // 密钥交换算法
  signature: 'HMAC-SHA256'; // 签名算法
}
```

#### 6.2.2 输入验证
```typescript
// DTO验证示例
export class CreateUserDto {
  @IsString()
  @Length(3, 20)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  password: string;

  @IsEmail()
  email: string;

  @IsMobilePhone('zh-CN')
  mobile: string;
}
```

### 6.3 API限流

#### 6.3.1 限流策略
```typescript
// 限流配置
const RATE_LIMIT_CONFIG = {
  // 全局限流
  global: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 1000,                // 最大请求数
    message: '请求过于频繁，请稍后再试'
  },
  
  // 用户级限流
  user: {
    windowMs: 60 * 1000,     // 1分钟
    max: 100,                // 每用户最大请求数
    keyGenerator: (req) => req.user?.id || req.ip
  },
  
  // 接口级限流
  endpoint: {
    'POST /api/v1/buyer/auth/login': {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 5,                     // 登录接口限制
      skipSuccessfulRequests: true
    }
  }
};
```

## 7. 版本控制规范

### 7.1 URL版本控制
```
/api/v1/buyer/product/list    // v1版本
/api/v2/buyer/product/list    // v2版本
```

### 7.2 Header版本控制
```http
Accept: application/vnd.mallecto.v1+json
```

### 7.3 版本兼容策略

#### 7.3.1 向后兼容原则
- **新增字段**: 向后兼容，客户端可忽略
- **删除字段**: 通过版本控制处理，低版本保持原有字段
- **字段类型变更**: 通过版本控制，新增字段或保持兼容
- **接口行为变更**: 通过版本控制，保持低版本行为不变

#### 7.3.2 版本生命周期
```
v1.0 - 当前版本 (2024.01-2025.12)
v1.1 - 增强版本 (2024.06-2026.06)
v2.0 - 重大更新 (2025.01-2027.01)
```

## 8. 性能优化规范

### 8.1 响应时间要求

| 接口类型 | 响应时间要求 | 描述 |
|----------|--------------|------|
| 查询接口 | ≤ 200ms | 简单查询操作 |
| 复杂查询 | ≤ 500ms | 涉及多表关联查询 |
| 写操作 | ≤ 1000ms | 数据库写操作 |
| 文件上传 | ≤ 5000ms | 文件上传操作 |
| 批量操作 | ≤ 10000ms | 批量数据处理 |

### 8.2 数据分页规范
```typescript
// 默认分页参数
const DEFAULT_PAGINATION = {
  page: 1,           // 默认页码
  limit: 20,         // 默认每页数量
  maxLimit: 100      // 最大每页数量限制
};

// 游标分页(大数据量场景)
interface CursorPagination {
  cursor?: string;    // 游标位置
  limit: number;     // 每页数量
  direction?: 'forward' | 'backward'; // 查询方向
}
```

### 8.3 缓存策略
```typescript
// 缓存配置
const CACHE_CONFIG = {
  // 商品信息缓存
  product: {
    ttl: 3600,        // 1小时
    key: (productId) => `product:${productId}`
  },
  
  // 用户信息缓存
  user: {
    ttl: 1800,        // 30分钟
    key: (userId) => `user:${userId}`
  },
  
  // 分类信息缓存
  category: {
    ttl: 7200,        // 2小时
    key: (categoryId) => `category:${categoryId}`
  }
};
```

## 9. 监控和日志规范

### 9.1 日志格式
```typescript
// 结构化日志格式
interface LogEntry {
  timestamp: string;     // 时间戳
  level: LogLevel;       // 日志级别
  service: string;       // 服务名称
  traceId: string;       // 追踪ID
  userId?: string;       // 用户ID
  method: string;        // HTTP方法
  url: string;          // 请求URL
  statusCode: number;    // 响应状态码
  duration: number;      // 请求耗时(ms)
  message: string;       // 日志消息
  data?: any;          // 附加数据
}
```

### 9.2 监控指标
```typescript
// 关键性能指标(KPI)
interface PerformanceMetrics {
  requestCount: number;        // 请求总数
  successRate: number;         // 成功率
  averageResponseTime: number;  // 平均响应时间
  p95ResponseTime: number;     // 95分位响应时间
  errorRate: number;           // 错误率
  concurrentUsers: number;      // 并发用户数
}
```

## 10. 开发工具和测试

### 10.1 API文档工具
- **Swagger/OpenAPI**: 自动生成API文档
- **Postman**: API测试和调试
- **Insomnia**: API客户端工具

### 10.2 测试规范
```typescript
// 单元测试要求
describe('ProductService', () => {
  it('should create product successfully', async () => {
    const productData = createValidProductData();
    const result = await productService.create(productData);
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe(productData.name);
  });
});

// 集成测试要求
describe('ProductController', () => {
  it('POST /api/v1/seller/product/create', async () => {
    const response = await request(app)
      .post('/api/v1/seller/product/create')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)
      .expect(201);
    
    expect(response.body.code).toBe(201);
    expect(response.body.data.productId).toBeDefined();
  });
});
```

---

本规范文档为MallEcoAPI项目的接口设计提供了完整的指导，确保API的一致性、可维护性和可扩展性。所有开发人员应严格按照此规范进行API设计和实现。